import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { Word } from '../words/word.entity';
import { WordModule } from '../words/word.module';
import { UserWordsModule } from 'src/user-words/user-words.module';
import { UserScoreModule } from 'src/user-score/user-score.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Word]),
    WordModule,
    UserWordsModule,
    UserScoreModule,
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
