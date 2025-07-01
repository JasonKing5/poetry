import { Module } from '@nestjs/common';
import { PoetryService } from './poem.service';
import { PoetryController } from './poem.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoetryService],
  controllers: [PoetryController]
})
export class PoetryModule {}
