// update-user-score.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SaveUserScoreDto {
  @IsNumber()
  currentPerform!: number;

  @IsString()
  @IsOptional()
  rank?: string;
}
