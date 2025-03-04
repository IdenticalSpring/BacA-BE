import { IsInt, IsString } from 'class-validator';

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
}

export class UpdateTeacherTestCommentDto {
  @IsString()
  skillComment?: string;
}
