import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';

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

  @IsDateString() // Thêm trường date
  date: string;
}

export class UpdateTeacherCommentOnStudentDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsDateString() // Thêm trường date
  date?: string;
}
