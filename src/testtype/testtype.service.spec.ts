import { Test, TestingModule } from '@nestjs/testing';
import { TesttypeService } from './testtype.service';

describe('TesttypeService', () => {
  let service: TesttypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TesttypeService],
    }).compile();

    service = module.get<TesttypeService>(TesttypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
