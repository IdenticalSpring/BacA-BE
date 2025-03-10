import { Test, TestingModule } from '@nestjs/testing';
import { ClassScheduleService } from './classSchedule.service';

describe('ClassScheduleService', () => {
  let service: ClassScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassScheduleService],
    }).compile();

    service = module.get<ClassScheduleService>(ClassScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
