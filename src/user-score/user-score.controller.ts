import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserScoreService } from './user-score.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decarators/get-user.decarator';

@Controller('user-score')
export class UserScoreController {
  constructor(private readonly service: UserScoreService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUserScore(@GetUser() user: { sub: number; email: string }) {
    return await this.service.findByUserId(user.sub);
  }
}
