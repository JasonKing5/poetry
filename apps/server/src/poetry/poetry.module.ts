import { Module } from '@nestjs/common';
import { PoetryService } from './poetry.service';
import { PoetryController } from './poetry.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PoetryService],
  controllers: [PoetryController]
})
export class PoetryModule {}
