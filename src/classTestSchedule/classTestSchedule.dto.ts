import { IsDateString, IsNumber } from 'class-validator';

export class CreateClassTestScheduleDto {
  @IsNumber()
  classID: number;

  @IsNumber()
  testID: number;

  @IsDateString()
  date?: string;
}
