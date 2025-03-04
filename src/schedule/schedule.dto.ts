import { IsString, IsDateString } from 'class-validator';

export class CreateScheduleDto {
  @IsString() // Sửa lại từ @IsTime()
  startTime: string;

  @IsString() // Sửa lại từ @IsTime()
  endTime: string;

  @IsDateString()
  date: string;
}

export class UpdateScheduleDto {
  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;

  @IsDateString()
  date?: string;
}
