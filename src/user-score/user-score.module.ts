import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserScore } from './entities/user-score.entity';
import { UserScoreService } from './user-score.service';
import { UserScoreController } from './user-score.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserScore])],
  controllers: [UserScoreController],
  providers: [UserScoreService],
  exports: [UserScoreService],
})
export class UserScoreModule {}
