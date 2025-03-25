import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsString()
  classID?: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  classID?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
