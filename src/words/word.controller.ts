import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WordService } from './word.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('word')
export class WordController {
  constructor(private readonly service: WordService) {}

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async list(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
    @Query('letter') letter?: string,
    @Query('sortBy') sortBy?: 'popular' | 'alphabetical' | 'random',
  ) {
    return await this.service.list({
      limit: limit ? parseInt(limit, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      letter,
      sortBy,
    });
  }
}
