import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  studentID: number;
}

export class UpdateFeedbackDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
