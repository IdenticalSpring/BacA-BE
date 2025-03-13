import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString() // Sửa lại từ @IsTime()
  startTime: string;

  @IsString() // Sửa lại từ @IsTime()
  endTime: string;

  @IsNumber()
  dayOfWeek: number;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
export class dayOfWeekScheduleDto {
  @IsNumber() // Sửa lại từ @IsTime()
  dayOfWeek: number;
}
export class UpdateScheduleDto {
  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;

  @IsDateString()
  dayOfWeek?: string;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
