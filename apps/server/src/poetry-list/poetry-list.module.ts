import { Module } from '@nestjs/common';
import { PoetryListService } from './poetry-list.service';
import { PoetryListController } from './poetry-list.controller';

@Module({
  controllers: [PoetryListController],
  providers: [PoetryListService],
})
export class PoetryListModule {}
