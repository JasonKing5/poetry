import { Test, TestingModule } from '@nestjs/testing';
import { PoetryPropService } from './poetry-prop.service';

describe('PoetryPropService', () => {
  let service: PoetryPropService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PoetryPropService],
    }).compile();

    service = module.get<PoetryPropService>(PoetryPropService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
