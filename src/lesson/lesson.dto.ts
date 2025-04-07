import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  linkYoutube?: string;
  @IsOptional()
  @IsString()
  linkGame?: string;
  @IsOptional()
  @IsString()
  linkSpeech?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  lessonPlan?: string;

  @IsOptional()
  @IsInt()
  level?: number; // Thêm level vào Update DTO
  @IsInt()
  teacherId: number; // Thêm level vào Update DTO

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsDateString() // Thêm trường date
  date?: string;
}

export class UpdateLessonDto extends CreateLessonDto {}
export class findLessonByLevelAndTeacherIdDto {
  @IsInt()
  level: number;
  @IsInt()
  teacherId: number;
}
