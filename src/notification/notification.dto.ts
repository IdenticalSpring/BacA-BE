import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsString()
  classID?: number;

  @IsOptional()
  @IsBoolean()
  general?: boolean;
  @IsOptional()
  @IsBoolean()
  type?: boolean;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsString()
  classID?: number;

  @IsOptional()
  @IsBoolean()
  general?: boolean;
  @IsOptional()
  @IsBoolean()
  type?: boolean;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
