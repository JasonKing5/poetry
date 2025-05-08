import { Controller, Get } from '@nestjs/common';
import { PoetryPropService } from './poetry-prop.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('poetryprops')
export class PoetryPropController {
  constructor(private readonly poetryPropService: PoetryPropService) {}

  @Get('authors')
  @Public()
  async findAllAuthor() {
    return await this.poetryPropService.findAllAuthor();
  }

  @Get('types')
  @Public()
  async findAllType() {
    return await this.poetryPropService.findAllType();
  }

  @Get('tags')
  @Public()
  async findAllTags() {
    return await this.poetryPropService.findAllTags();
  }

  @Get('lunar')
  @Public()
  async findLunar() {
    return await this.poetryPropService.findLunar();
  }
}
