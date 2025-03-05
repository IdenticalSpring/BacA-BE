import { IsString } from 'class-validator';

export class CreateAssessmentsDto {
  @IsString()
  name: string;
}

export class UpdateAssessmentsDto {
  @IsString()
  name?: string;
}
