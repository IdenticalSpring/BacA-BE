import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateAdminDto {
  @IsString()
  username?: string;

  @IsString()
  @MinLength(6)
  password?: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
