import { Test, TestingModule } from '@nestjs/testing';
import { PoetryController } from './poetry.controller';

describe('PoetryController', () => {
  let controller: PoetryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoetryController],
    }).compile();

    controller = module.get<PoetryController>(PoetryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
