import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCheckinDto {
  @IsNotEmpty()
  @IsNumber()
  lessonByScheduleId: number;

  @IsNotEmpty()
  attendanceData: AttendanceDataDto[];
}

export class AttendanceDataDto {
  @IsNotEmpty()
  @IsNumber()
  studentId: number;

  @IsNotEmpty()
  @IsNumber()
  present: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateCheckinDto {
  @IsOptional()
  @IsNumber()
  present?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
