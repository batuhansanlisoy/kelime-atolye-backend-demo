import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserWordService } from './user-words.service';
import { GetUser } from 'src/auth/decarators/get-user.decarator';
import { CreateUserWordDto } from './dto/create-user-word.dto';
import { UserScoreService } from 'src/user-score/user-score.service';
import { SaveUserScoreDto } from 'src/user-score/dto/save-user-score.dto';

@Controller('user-words')
export class UserWordsController {
  constructor(
    private readonly userWordService: UserWordService,
    private readonly userScoreService: UserScoreService,
  ) {}

  @Post('save')
  @UseGuards(AuthGuard('jwt'))
  async save(
    @GetUser() user: { sub: number; email: string },
    @Body() dto: CreateUserWordDto[],
    @Query('initial') initial?: string,
  ) {
    const resp = await this.userWordService.save(user.sub, dto);

    const wordIds = dto.map((m) => m.wordId);

    const userWords = await this.userWordService.getByUserId(
      user.sub,
      true,
      wordIds,
    );

    const isInitial = initial === 'true' || initial === '1';
    let score: number;

    if (isInitial) {
      score = this.userScoreService.initialScoreCalculate(user.sub, userWords);
    } else {
      score = await this.userScoreService.scoreCalculate(user.sub, userWords);
    }

    const payload: SaveUserScoreDto = {
      currentPerform: score,
      rank: '',
    };

    await this.userScoreService.save(user.sub, payload);

    return resp;
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async stats(@GetUser() user: { sub: number; email: string }) {
    return await this.userWordService.stats(user.sub);
  }
}
