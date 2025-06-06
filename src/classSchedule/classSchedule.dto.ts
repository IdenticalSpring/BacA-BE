import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreateClassScheduleDto {
  @IsInt()
  classID: number;

  @IsInt()
  scheduleID: number;

  @IsInt()
  lessonID: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateClassScheduleDto {
  @IsInt()
  classID?: number;

  @IsInt()
  scheduleID?: number;

  @IsInt()
  lessonID?: number;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
