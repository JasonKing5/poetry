import { Test, TestingModule } from '@nestjs/testing';
import { PoetryListController } from './poetry-list.controller';
import { PoetryListService } from './poetry-list.service';

describe('PoetryListController', () => {
  let controller: PoetryListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoetryListController],
      providers: [PoetryListService],
    }).compile();

    controller = module.get<PoetryListController>(PoetryListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
