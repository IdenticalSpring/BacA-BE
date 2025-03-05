import { Test, TestingModule } from '@nestjs/testing';
import { TeachercommentonstudentController } from './teachercommentonstudent.controller';

describe('TeachercommentonstudentController', () => {
  let controller: TeachercommentonstudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachercommentonstudentController],
    }).compile();

    controller = module.get<TeachercommentonstudentController>(
      TeachercommentonstudentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
