import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { PoetryService } from 'src/poem/poem.service';

@Module({
  controllers: [CollectionController],
  providers: [CollectionService, PoetryService],
})
export class CollectionModule {}
