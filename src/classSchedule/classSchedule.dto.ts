import { IsInt } from 'class-validator';

export class CreateClassScheduleDto {
  @IsInt()
  classID: number;

  @IsInt()
  scheduleID: number;

  @IsInt()
  lessonID: number;
}

export class UpdateClassScheduleDto {
  @IsInt()
  classID?: number;

  @IsInt()
  scheduleID?: number;

  @IsInt()
  lessonID?: number;
}
