import { IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateStudent_lesson_countDto {
  @IsOptional()
  @IsInt()
  count?: number;
  @IsInt()
  lessonId: number;
  @IsInt()
  studentId: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateStudent_lesson_countDto {
  @IsOptional()
  @IsInt()
  count?: number;
  @IsOptional()
  @IsInt()
  lessonId?: number;
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
export class UpdateCountDto {
  @IsOptional()
  @IsInt()
  lessonId?: number;
  @IsOptional()
  @IsInt()
  studentId?: number;
}
class OneStudent {
  @IsOptional()
  @IsInt()
  studentId?: number;
}
export class AllStudentOfClassDto {
  students: OneStudent[];
}
