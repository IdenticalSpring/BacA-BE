import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentsDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateAssessmentsDto {
  @IsString()
  name?: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
