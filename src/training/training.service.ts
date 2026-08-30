import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from '.././words/word.entity';
import { WordService } from '.././words/word.service';
import { UserWordService } from 'src/user-words/user-words.service';
import { UserScoreService } from 'src/user-score/user-score.service';
import { UserScore } from 'src/user-score/entities/user-score.entity';
import { TraininSubMode } from './enums/training-submode.enum';

@Injectable()
export class TrainingService {
  constructor(
    private readonly wordService: WordService,
    private readonly userWordService: UserWordService,
    private readonly userScoreService: UserScoreService,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
  ) {}

  async questionWithOptions(
    userId: number,
    limit: number = 10,
    subMode: TraininSubMode,
  ) {
    let words: Word[] = [];
    let userScore: UserScore | null = null;

    try {
      userScore = await this.userScoreService.findByUserId(userId);
    } catch {
      // burda findByUserId throw atıyor patlamamsı için kullanıyorum ve boş geçiyorum.
    }

    // moda göre fonskiyon barındıran map
    const modeStrategies: Record<TraininSubMode, () => Promise<Word[]>> = {
      [TraininSubMode.INITIAL]: () => this.initialWords(),
      [TraininSubMode.REINFORCE]: () => this.reinforcedWords(userId, limit),
      [TraininSubMode.MISTAKE]: () => this.mistakeWords(userId, limit),
      [TraininSubMode.EXPLORE]: () =>
        this.exploreWords(userId, userScore!, limit),
      [TraininSubMode.STANDARD]: () => this.standartWords(limit, userScore!),
    };

    // hiç verisi olmayan adamın scoruda olamaz mode initial ve score yoksa bu adama initial load yapmak lazım.
    if (subMode === TraininSubMode.INITIAL && !userScore) {
      words = await modeStrategies[TraininSubMode.INITIAL]();
    }

    // diğer durumda kesinlikle userScore vardır demek mantık olarak backend patlak vermezse yani o zaman diğer modlara göre işlem
    if (userScore) {
      const selectedStrategy =
        modeStrategies[subMode] || modeStrategies[TraininSubMode.STANDARD];

      words = await selectedStrategy();
    }

    const wordsWithOptions = await Promise.all(
      words.map(async (word) => {
        const options = await this.generateOptions(word.id);
        return {
          ...word,
          options,
        };
      }),
    );

    return wordsWithOptions;
  }

  private async initialWords(): Promise<Word[]> {
    const ranges = [
      { min: -10, max: -3 },
      { min: -12, max: -11 },
      { min: -14, max: -13 },
    ];

    let words: Word[] = [];

    for (const range of ranges) {
      const groupedWords = await this.wordService.list({
        minFrequency: range.min,
        maxFrequency: range.max,
        limit: 10,
      });

      words = words.concat(groupedWords);
    }

    return words.sort(() => Math.random() - 0.5); // bi turda kendi içinde karıştırıyor.
  }

  private async standartWords(
    limit: number,
    userScore: UserScore,
  ): Promise<Word[]> {
    const minFrequency = userScore.currentPerform - 1.5;
    const maxFrequency = userScore.currentPerform;

    return await this.wordService.list({
      limit: limit,
      minFrequency: minFrequency,
      maxFrequency: maxFrequency,
    });
  }

  /**
   * Kullanının aktif havuzundaki kelimeleri getirir
   * Kullanıcı aktif havuzdaki kelimelerle antreman yaparak kelimeleri pekiştirir
   * Bunu yapmak için daha önce karşılaştığı kelimelrin id'sini çekeriz
   * Daha sonra wordService ile onlyId içine koyarak word listesi elimize geçer
   * @param userId kullanıcı id'si
   * @param limit WordIds leri çekerken hepsini çekmek istemiyoruz bazı durumlarda
   * @returns word[]
   */
  private async reinforcedWords(
    userId: number,
    limit: number,
  ): Promise<Word[]> {
    const userWordIds = await this.userWordService.getInteractedWordIds(
      userId,
      limit,
    );

    return await this.wordService.list({
      onlyIds: userWordIds,
    });
  }

  /**
   * Kullanıncın daha önce hiç görmediği kelimeleri getirir
   * Bunu yapmak için ilk önce etkileime geçtigi bütütün kelimelerin id sini buluruz
   * daha sonra wordService fonksiyonun exluceIds içerisine bunları yollarız
   * @param userId kullanıcı id'si
   * @returns word[]
   */
  private async exploreWords(
    userId: number,
    userScore: UserScore,
    limit: number,
  ): Promise<Word[]> {
    const userWordIds = await this.userWordService.getInteractedWordIds(userId);

    // keşfet mantıgı scoredan bağımsız mı yoksa bağımlı mı olacak daha sonra karar ver.
    // const minFrequency = userScore.currentPerform - 1.5;
    // const maxFrequency = userScore.currentPerform;

    return await this.wordService.list({
      excludeIds: userWordIds,
      limit: limit,
    });
  }

  /**
   * Kullanıcının sürekli hata yaptığı kelimeleri getirir
   * Bunu yapmak için hata yapılan Ids leri buluruz
   * Daha sonra wordService onlyId kullanarak bu id leri yollarayarak hata yapılan kelimeleri buluruz
   * @param userId kullanıcı id'si
   * @param limit burda bütün kelimeleri getirmek istemeyebiliriz o yüzden parça parça getirm mantıgı
   * @returns word[]
   */
  private async mistakeWords(userId: number, limit: number): Promise<Word[]> {
    const userWordMistakedIds = await this.userWordService.getMistakeWordIds(
      userId,
      limit,
    );

    return await this.wordService.list({ onlyIds: userWordMistakedIds });
  }

  // bunu daha sonra servis ile yapacağız burda repo olmamalı
  private async generateOptions(currentWordId: number): Promise<Word[]> {
    const currentWord = await this.wordRepository.findOne({
      where: { id: currentWordId },
    });

    if (!currentWord) {
      throw new Error('Kelime bulunamadı');
    }

    const wrongWords = await this.wordRepository
      .createQueryBuilder('word')
      .where('word.id != :currentWordId', { currentWordId })
      .andWhere('word.frequency BETWEEN :minFreq AND :maxFreq', {
        minFreq: currentWord.frequency - 1.5,
        maxFreq: currentWord.frequency + 1.5,
      })
      .orderBy('RAND()')
      .limit(3)
      .getMany();

    let finalWrongWords = wrongWords;

    if (finalWrongWords.length < 3) {
      finalWrongWords = await this.wordRepository
        .createQueryBuilder('word')
        .where('word.id != :currentWordId', { currentWordId })
        .orderBy('RAND()')
        .limit(3)
        .getMany();
    }

    const allOptions = [...finalWrongWords, currentWord];
    return allOptions.sort(() => Math.random() - 0.5);
  }
}
