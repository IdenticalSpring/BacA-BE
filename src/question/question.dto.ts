import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsInt()
  teacherID: number;

  @IsInt()
  classID: number;

  @IsOptional()
  @IsInt()
  homeWorkId?: number; // Thêm dòng này

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateQuestionDto {
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsInt()
  homeWorkId?: number; // Thêm dòng này nếu muốn update homework
}
