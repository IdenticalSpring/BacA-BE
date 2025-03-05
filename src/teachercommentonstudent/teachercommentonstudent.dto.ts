import { IsString, IsInt } from 'class-validator';

export class CreateTeacherCommentOnStudentDto {
  @IsInt()
  teacherID: number;

  @IsInt()
  studentID: number;

  @IsInt()
  scheduleID: number;

  @IsString()
  comment: string;
}

export class UpdateTeacherCommentOnStudentDto {
  @IsString()
  comment?: string;
}
