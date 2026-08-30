import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserScore } from './entities/user-score.entity';
import { SaveUserScoreDto } from './dto/save-user-score.dto';
import { UserWord } from 'src/user-words/entities/user-word.entity';

@Injectable()
export class UserScoreService {
  constructor(
    @InjectRepository(UserScore)
    private readonly repository: Repository<UserScore>,
  ) {}

  async findByUserId(userId: number): Promise<UserScore> {
    const score = await this.repository.findOne({
      where: { user: { id: userId } },
    });

    if (!score) {
      throw new NotFoundException('Kullanıcya ait skor bulunamadı');
    }

    return score;
  }

  async save(userId: number, dto: SaveUserScoreDto): Promise<UserScore> {
    let userScore = await this.repository.findOne({
      where: { user: { id: userId } },
    });

    if (userScore) {
      userScore.currentPerform = dto.currentPerform;
    } else {
      userScore = this.repository.create({ ...dto, user: { id: userId } });
    }

    return await this.repository.save(userScore);
  }

  async scoreCalculate(userId: number, items: UserWord[]): Promise<number> {
    const totalAttempt: number = items.length;
    let totalWeightedFrequency: number = 0;

    items.forEach((item) => {
      const successRate =
        item.correctCount / (item.correctCount + item.wrongCount);

      const wordFrequency = item.word?.frequency;

      totalWeightedFrequency +=
        wordFrequency! * (successRate * 0.5 + successRate);
    });

    const currentPerformance = totalWeightedFrequency / totalAttempt;

    const existingScore = await this.repository.findOne({
      where: { user: { id: userId } },
    });

    let finalPerformance = currentPerformance;

    if (existingScore && existingScore.currentPerform != null) {
      // Varsa: Eski skorun %95'i + Yeni hesaplanan performansın %5'i
      finalPerformance =
        existingScore.currentPerform * 0.95 + currentPerformance * 0.05;
    }

    return finalPerformance > -3 ? -3 : finalPerformance;
  }

  initialScoreCalculate(userId: number, items: UserWord[]): number {
    const totalAttempt: number = items.length;
    let totalWeightedFrequency: number = 0;

    items.forEach((item) => {
      const successRate =
        item.correctCount / (item.correctCount + item.wrongCount);

      const wordFrequency = item.word?.frequency;

      totalWeightedFrequency += wordFrequency! * successRate;
    });

    const performance = totalWeightedFrequency / totalAttempt;

    return performance > -3 ? -3 : performance;
  }

  // async scoreCalculate(userId: number, items: UserWord[]): Promise<number> {
  //   const correctWeight: number = 1;
  //   const wrongWeight: number = 0.9;
  //   const totalAttempt: number = items.length;
  //   let totalWeightedFrequency: number = 0;

  //   items.forEach((item) => {
  //     const isCorrect = item.correctCount > 0;
  //     const wordFrequency = item.word?.frequency;

  //     if (isCorrect) {
  //       totalWeightedFrequency += wordFrequency! * correctWeight;
  //     } else {
  //       totalWeightedFrequency += wordFrequency! * wrongWeight;
  //     }
  //   });

  //   const currentPerformance = totalWeightedFrequency / totalAttempt;

  //   const existingScore = await this.repository.findOne({
  //     where: { user: { id: userId } },
  //   });

  //   let finalPerformance = currentPerformance;

  //   if (existingScore && existingScore.currentPerform != null) {
  //     // Varsa: Eski skorun %95'i + Yeni hesaplanan performansın %5'i
  //     finalPerformance =
  //       existingScore.currentPerform * 0.95 + currentPerformance * 0.05;
  //   }

  //   return finalPerformance;
  // }
}
