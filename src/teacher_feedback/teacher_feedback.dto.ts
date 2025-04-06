import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTeacherFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  teacherID: number;
}

export class UpdateTeacherFeedbackDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  teacherID?: number;
}
