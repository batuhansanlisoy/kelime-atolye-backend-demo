import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserWord } from './entities/user-word.entity';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateUserWordDto } from './dto/create-user-word.dto';
import { UserScoreService } from 'src/user-score/user-score.service';

@Injectable()
export class UserWordService {
  constructor(
    @InjectRepository(UserWord)
    private userWordRepository: Repository<UserWord>,
    private readonly userScoreService: UserScoreService,
  ) {}

  //reinforce için kullanılıyor userId ye göre word id leri getiriyor
  // getByUserId den farkı o entity getiriyor bu sadece id
  async getInteractedWordIds(
    userId: number,
    limit?: number,
  ): Promise<number[]> {
    const qb = this.userWordRepository
      .createQueryBuilder('uw')
      .select('uw.word_id', 'wordId')
      .where('uw.user.id = :userId', { userId })
      .orderBy('RAND()');

    if (limit) {
      qb.limit(limit);
    }

    const results = await qb.getRawMany<{ wordId: number }>();

    return results.map((row) => row.wordId);
  }

  async getMistakeWordIds(userId: number, limit?: number): Promise<number[]> {
    const qb = this.userWordRepository
      .createQueryBuilder('uw')
      .select('uw.word_id', 'wordId')
      .where('uw.user.id = :userId', { userId })
      .andWhere('(uw.correct_count + uw.wrong_count) > 0')
      .andWhere(
        '(uw.wrong_count * 1.0) / (uw.correct_count + uw.wrong_count) > 0.5',
      )
      .andWhere('uw.wrong_count >= 2')
      .orderBy('RAND()');

    if (limit) {
      qb.limit(limit);
    }

    const results = await qb.getRawMany<{ wordId: number }>();

    return results.map((row) => row.wordId);
  }

  async getByUserId(
    userId: number,
    withWord: boolean,
    wordIds?: number[],
  ): Promise<UserWord[]> {
    const where: FindOptionsWhere<UserWord> = {
      user: { id: userId },
    };

    if (wordIds && wordIds.length > 0) {
      where.word = { id: In(wordIds) };
    }

    return await this.userWordRepository.find({
      where,
      relations: { word: withWord },
    });
  }

  //şimdi 10 tane kelime geliyor diyelim bunlar hem var olabilir hem var olmayabilir o yüzden bu 10 kelimeyi idsinn bulup çekmem lazım
  async save(
    userId: number,
    dto: CreateUserWordDto[],
  ): Promise<{ success: boolean }> {
    if (!dto.length) {
      return { success: true };
    }

    const values: any[] = [];
    const placeholders = dto
      .map((item) => {
        values.push(userId, item.wordId, item.correctCount, item.wrongCount);
        return '(?, ?, ?, ?)';
      })
      .join(', ');

    const query = `
      INSERT INTO user_words (user_id, word_id, correct_count, wrong_count)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        correct_count = correct_count + VALUES(correct_count),
        wrong_count = wrong_count + VALUES(wrong_count);
    `;

    await this.userWordRepository.query(query, values);

    return { success: true };
  }

  async stats(userId: number) {
    // 1. Toplam keşfedilen kelime sayısı
    const totalWordCount = await this.userWordRepository.count({
      where: { user: { id: userId } },
    });

    // 2. SQL QueryBuilder ile oran hesabını direkt veritabanına yaptırıyoruz
    const queryBuilder = this.userWordRepository
      .createQueryBuilder('uw')
      .where('uw.user_id = :userId', { userId });

    // ezberlenenler
    const memorizedWordCount = await queryBuilder
      .clone()
      .andWhere(
        '(uw.correct_count / (uw.correct_count + uw.wrong_count)) >= :rate',
        { rate: 0.7 },
      )
      .andWhere('uw.correct_count >= 3')
      .getCount();

    // sürekli hata yapılanlar
    const mistakedWordCount = await queryBuilder
      .clone()
      .andWhere(
        '(uw.correct_count / (uw.correct_count + uw.wrong_count)) <= :rate',
        { rate: 0.5 },
      )
      .andWhere('uw.wrong_count >= 2')
      .getCount();

    return {
      totalWordCount,
      memorizedWordCount,
      mistakedWordCount,
    };
  }
}
