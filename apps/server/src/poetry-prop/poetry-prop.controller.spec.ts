import { Test, TestingModule } from '@nestjs/testing';
import { PoetryPropController } from './poetry-prop.controller';

describe('PoetryPropController', () => {
  let controller: PoetryPropController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoetryPropController],
    }).compile();

    controller = module.get<PoetryPropController>(PoetryPropController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
