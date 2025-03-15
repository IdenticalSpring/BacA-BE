import { Test, TestingModule } from '@nestjs/testing';
import { LessonByScheduleService } from './lesson_by_schedule.service';

describe('LessonByScheduleService', () => {
  let service: LessonByScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonByScheduleService],
    }).compile();

    service = module.get<LessonByScheduleService>(LessonByScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
