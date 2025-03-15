import { IsInt, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateTestResultDto {
  @IsInt()
  studentID: number;

  @IsInt()
  classID: number;

  @IsInt()
  testTypeID: number;

  @IsInt()
  assessmentsID: number;

  @IsOptional()
  @IsInt()
  teacherCommentID?: number;

  @IsOptional()
  @IsNumber()
  listenScore?: number;

  @IsOptional()
  @IsNumber()
  speakingScore?: number;

  @IsOptional()
  @IsNumber()
  readingWritingScore?: number;

  @IsOptional()
  @IsNumber()
  averageScore?: number;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateTestResultDto extends CreateTestResultDto {}
