import { Test, TestingModule } from '@nestjs/testing';
import { LessonByScheduleController } from './lesson_by_schedule.controller';
import { LessonByScheduleService } from './lesson_by_schedule.service';

describe('LessonByScheduleController', () => {
  let controller: LessonByScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonByScheduleController],
      providers: [LessonByScheduleService],
    }).compile();

    controller = module.get<LessonByScheduleController>(
      LessonByScheduleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
