import { Test, TestingModule } from '@nestjs/testing';
import { PoetryListService } from './poetry-list.service';

describe('PoetryListService', () => {
  let service: PoetryListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoetryListService],
    }).compile();

    service = module.get<PoetryListService>(PoetryListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
