import {
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsInt()
  teacherID: number;
  @IsOptional()
  @IsInt()
  level?: number; // Thêm level (có thể không bắt buộc)
  @IsString()
  accessId: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
  @IsOptional()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'classPin must be exactly 4 digits' })
  classPin?: string;
}

export class UpdateClassDto {
  @IsString()
  name?: string;

  @IsInt()
  teacherID?: number;
  @IsOptional()
  @IsInt()
  level?: number; // Thêm level vào Update DTO
  @IsOptional()
  @IsString()
  accessId?: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;
  @IsOptional()
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'classPin must be exactly 4 digits' })
  classPin?: string;
}

