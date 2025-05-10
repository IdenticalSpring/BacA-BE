import { Test, TestingModule } from '@nestjs/testing';
import { Student_vocabularyService } from './student_vocabulary.service';

describe('Student_vocabularyService', () => {
  let service: Student_vocabularyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Student_vocabularyService],
    }).compile();

    service = module.get<Student_vocabularyService>(Student_vocabularyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
