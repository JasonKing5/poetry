import { Module } from '@nestjs/common';
import { PoetryPropController } from './poetry-prop.controller';
import { PoetryPropService } from './poetry-prop.service';

@Module({
  controllers: [PoetryPropController],
  providers: [PoetryPropService]
})
export class PoetryPropModule {}
