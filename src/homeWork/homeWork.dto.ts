import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateHomeWorkDto {
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
  linkSpeech: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  level?: number; // Thêm level vào Update DTO
  @IsInt()
  teacherId: number; // Thêm level vào Update DTO

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateHomeWorkDto extends CreateHomeWorkDto {}
export class findHomeWorkByLevelAndTeacherIdDto {
  @IsInt()
  level: number;
  @IsInt()
  teacherId: number;
}
