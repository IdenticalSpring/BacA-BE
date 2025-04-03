import { Test, TestingModule } from '@nestjs/testing';
import { Student_homework_countService } from './student_homework_count.service';

describe('Student_homework_countService', () => {
  let service: Student_homework_countService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Student_homework_countService],
    }).compile();

    service = module.get<Student_homework_countService>(
      Student_homework_countService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
