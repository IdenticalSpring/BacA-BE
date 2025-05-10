import { Test, TestingModule } from '@nestjs/testing';
import { Student_vocabularyController } from './student_vocabulary.controller';

describe('Student_vocabularyController', () => {
  let controller: Student_vocabularyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Student_vocabularyController],
    }).compile();

    controller = module.get<Student_vocabularyController>(
      Student_vocabularyController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
