import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Word } from './word.entity';
import { WordController } from './word.controller';
import { WordService } from './word.service';

@Module({
  imports: [TypeOrmModule.forFeature([Word])],
  controllers: [WordController],
  providers: [WordService],
  exports: [WordService],
})
export class WordModule {}
