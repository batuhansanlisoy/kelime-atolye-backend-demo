import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decarators/get-user.decarator';
import { TraininSubMode } from './enums/training-submode.enum';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async getTrainingList(
    @Query('subMode') subMode: TraininSubMode,
    @GetUser() user: { sub: number; email: string },
    @Query('limit') limit?: number,
  ) {
    return await this.trainingService.questionWithOptions(
      user.sub,
      limit,
      subMode,
    );
  }
}
