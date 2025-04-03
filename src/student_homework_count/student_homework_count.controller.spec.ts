import { Test, TestingModule } from '@nestjs/testing';
import { Student_homework_countController } from './student_homework_count.controller';

describe('Student_homework_countController', () => {
  let controller: Student_homework_countController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Student_homework_countController],
    }).compile();

    controller = module.get<Student_homework_countController>(
      Student_homework_countController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
