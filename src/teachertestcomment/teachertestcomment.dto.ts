import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTeacherTestCommentDto {
  @IsInt()
  teacherID: number;

  @IsInt()
  studentID: number;

  @IsInt()
  classID: number;

  @IsInt()
  scheduleID: number;

  @IsString()
  skillComment: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateTeacherTestCommentDto {
  @IsString()
  skillComment?: string;
}
