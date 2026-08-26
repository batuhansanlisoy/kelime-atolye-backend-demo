import { Module } from '@nestjs/common';
import { UserWordsController } from './user-words.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWord } from './entities/user-word.entity';
import { UserWordService } from './user-words.service';
import { UserScoreModule } from 'src/user-score/user-score.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserWord]), UserScoreModule],
  controllers: [UserWordsController],
  providers: [UserWordService],
  exports: [UserWordService],
})
export class UserWordsModule {}
