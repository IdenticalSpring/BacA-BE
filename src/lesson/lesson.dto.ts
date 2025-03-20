import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  level?: string; // Thêm level vào Update DTO
  @IsInt()
  teacherId: number; // Thêm level vào Update DTO

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateLessonDto extends CreateLessonDto {}
export class findLessonByLevelAndTeacherIdDto {
  @IsString()
  level: string;
  @IsInt()
  teacherId: number;
}
