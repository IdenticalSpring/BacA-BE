import { Test, TestingModule } from '@nestjs/testing';
import { TeachertestcommentService } from './teachertestcomment.service';

describe('TeachertestcommentService', () => {
  let service: TeachertestcommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeachertestcommentService],
    }).compile();

    service = module.get<TeachertestcommentService>(TeachertestcommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
