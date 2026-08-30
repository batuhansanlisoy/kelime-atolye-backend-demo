import { Controller, Get, Query } from '@nestjs/common';
import { WordService } from './word.service';

@Controller('word')
export class WordController {
  constructor(private readonly service: WordService) {}

  @Get('list')
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
