import { Test, TestingModule } from '@nestjs/testing';
import { TestresultService } from './testresult.service';

describe('TestresultService', () => {
  let service: TestresultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestresultService],
    }).compile();

    service = module.get<TestresultService>(TestresultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
