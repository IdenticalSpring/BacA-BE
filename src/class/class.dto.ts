import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate?: string;

  @IsInt()
  teacherID: number;
}

export class UpdateClassDto {
  @IsString()
  name?: string;

  @IsDateString()
  startDate?: string;

  @IsDateString()
  endDate?: string;

  @IsInt()
  teacherID?: number;
}
