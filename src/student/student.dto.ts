import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  level?: number;

  // @IsOptional()
  // @Type(() => Date)
  // @IsDate()
  // yearOfBirth?: Date;

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

  // @IsOptional()
  // @Type(() => Date)
  // @IsDate()
  // birthOfDate?: Date;

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
