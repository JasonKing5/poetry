import { Module } from '@nestjs/common';
import { PoetryService } from './poem.service';
import { PoetryController } from './poem.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [PrismaModule, EmbeddingModule],
  providers: [PoetryService],
  controllers: [PoetryController],
  exports: [PoetryService]
})
export class PoetryModule {}
