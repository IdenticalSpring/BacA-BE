import {
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsInt()
  teacherID: number;
  @IsOptional()
  @IsString()
  level?: string; // Thêm level (có thể không bắt buộc)

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateClassDto {
  @IsString()
  name?: string;

  @IsInt()
  teacherID?: number;
  @IsOptional()
  @IsString()
  level?: string; // Thêm level vào Update DTO

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
