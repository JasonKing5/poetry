import { Module } from '@nestjs/common';
import { PoetryService } from './poem.service';
import { PoetryController } from './poem.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { PoetryPropModule } from '../poetry-prop/poetry-prop.module';

@Module({
  imports: [PrismaModule, EmbeddingModule, PoetryPropModule],
  providers: [PoetryService],
  controllers: [PoetryController],
  exports: [PoetryService]
})
export class PoetryModule {}
