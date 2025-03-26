import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateTeacherCommentOnStudentDto {
  @IsInt()
  teacherID: number;

  @IsInt()
  studentID: number;

  @IsInt()
  scheduleID: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateTeacherCommentOnStudentDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
