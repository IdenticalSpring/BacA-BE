import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateTestTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateTestTypeDto {
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
