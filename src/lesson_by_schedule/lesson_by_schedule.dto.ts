import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateLessonByScheduleDto {
  @IsInt()
  classID: number;

  @IsInt()
  scheduleID: number;

  @IsInt()
  lessonID: number;
  @IsInt()
  homeWorkId: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateLessonByScheduleDto {
  @IsInt()
  classID?: number;

  @IsInt()
  scheduleID?: number;

  @IsInt()
  lessonID?: number;
  @IsInt()
  homeWorkId?: number;
  @IsString()
  startTime?: string;

  @IsString()
  endTime?: string;

  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  isHomeWorkSent?: boolean;
  @IsOptional()
  @IsBoolean()
  isLessonSent?: boolean;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class CreateManyLessonsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonByScheduleDto)
  lessons: CreateLessonByScheduleDto[];
}
export class UpdateLessonOfLessonBySchedule {
  @IsInt()
  lessonID: number;
}
export class UpdateHomeWorkOfLessonBySchedule {
  @IsInt()
  homeWorkId: number;
}
export class UpdateSendingHomeworkStatusOfLessonBySchedule {
  @IsBoolean()
  isHomeWorkSent: boolean;
}
export class UpdateSendingLessonStatusOfLessonBySchedule {
  @IsBoolean()
  isLessonSent: boolean;
}
