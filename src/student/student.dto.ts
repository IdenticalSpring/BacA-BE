import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  level?: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

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
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  classID?: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
