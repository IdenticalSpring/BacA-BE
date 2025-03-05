import { IsString, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateLessonDto extends CreateLessonDto {}
