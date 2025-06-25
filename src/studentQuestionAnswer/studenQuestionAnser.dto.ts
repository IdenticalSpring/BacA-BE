import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateStudentQuestionAnswerDto {
  @IsInt()
  questionID: number;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  homeWorkId?: number;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsString()
  audio?: string;
}

export class UpdateStudentQuestionAnswerDto {
  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  audio?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  homeWorkId?: number;
}
