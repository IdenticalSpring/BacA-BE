import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateLevelDto {
  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
