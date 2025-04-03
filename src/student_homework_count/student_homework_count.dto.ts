import { Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateStudent_homework_countDto {
  @IsOptional()
  @IsInt()
  count?: number;
  @IsInt()
  homeworkId: number;
  @IsInt()
  studentId: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateStudent_homework_countDto {
  @IsOptional()
  @IsInt()
  count?: number;
  @IsOptional()
  @IsInt()
  homeworkId?: number;
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
export class UpdateCountDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  homeworkId?: number;
  @IsOptional()
  @Type(() => Number)
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
