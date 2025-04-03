import { Test, TestingModule } from '@nestjs/testing';
import { Student_lesson_countController } from './student-lesson-count.controller';

describe('Student_lesson_countController', () => {
  let controller: Student_lesson_countController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Student_lesson_countController],
    }).compile();

    controller = module.get<Student_lesson_countController>(
      Student_lesson_countController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
