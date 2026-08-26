import { IsNumber } from 'class-validator';

export class CreateUserWordDto {
  @IsNumber()
  wordId!: number;

  @IsNumber()
  correctCount!: number;

  @IsNumber()
  wrongCount!: number;
}
