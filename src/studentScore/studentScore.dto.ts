import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentScoreDto {
  @IsNumber()
  studentID: number;

  @IsNumber()
  classTestScheduleID: number;

  @IsNumber()
  writingScore: number;

  @IsNumber()
  readingScore: number;

  @IsNumber()
  speakingScore: number;

  @IsNumber()
  listeningScore: number;

  @IsNumber()
  avgScore: number;

  @IsOptional()
  @IsString() // Thêm teacherComment
  teacherComment?: string;

  @IsOptional()
  @IsNumber() // Thêm assessmentID
  assessmentID?: number;
}
