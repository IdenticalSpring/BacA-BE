import { Test, TestingModule } from '@nestjs/testing';
import { TeachercommentonstudentService } from './teachercommentonstudent.service';

describe('TeachercommentonstudentService', () => {
  let service: TeachercommentonstudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeachercommentonstudentService],
    }).compile();

    service = module.get<TeachercommentonstudentService>(
      TeachercommentonstudentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
