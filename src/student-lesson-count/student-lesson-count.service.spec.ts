import { Test, TestingModule } from '@nestjs/testing';
import { Student_lesson_countService } from './student-lesson-count.service';

describe('Student_lesson_countService', () => {
  let service: Student_lesson_countService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Student_lesson_countService],
    }).compile();

    service = module.get<Student_lesson_countService>(
      Student_lesson_countService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
