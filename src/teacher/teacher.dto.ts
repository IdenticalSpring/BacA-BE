import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsDateString()
  startDate: string;

  // @IsOptional()
  // @IsDateString()
  // endDate?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsString()
  fileUrl?: string; // Thêm thuộc tính fileUrl

  @IsOptional()
  @IsString()
  linkDrive?: string;
}

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  // @IsOptional()
  // @IsDateString()
  // endDate?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsString()
  fileUrl?: string; // Thêm thuộc tính fileUrl

  @IsOptional()
  @IsString()
  linkDrive?: string;
}
