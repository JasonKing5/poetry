import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { PoetryModule } from '../poem/poem.module';

@Module({
  imports: [PoetryModule],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
