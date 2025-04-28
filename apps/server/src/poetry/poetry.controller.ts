import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { PoetryService } from './poetry.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('poetry')
export class PoetryController {
  constructor(private readonly poetryService: PoetryService) {}

  @Get()
  @Public()
  async findAll(
    @Query() query: { title?: string, author?: string, type?: string, tags?: string[], page?: number, pageSize?: number }
  ) {
    let { title, author, type, tags, page, pageSize } = query;
    if (typeof page === 'string') page = parseInt(page, 10);
    if (typeof pageSize === 'string') pageSize = parseInt(pageSize, 10);
    if (typeof page !== 'number' || isNaN(page)) page = 1;
    if (typeof pageSize !== 'number' || isNaN(pageSize)) pageSize = 20;
    return await this.poetryService.findAll(title, author, type, tags, page, pageSize);
  }

  @Get('/:id')
  @Public()
  async findOne(@Param('id') id: number) {
    console.log('poetry id: ', id, typeof id);
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    return await this.poetryService.findOne(Number(id));
  }
}
