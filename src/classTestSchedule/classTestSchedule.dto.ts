import { IsNumber, IsString } from 'class-validator';

export class CreateClassTestScheduleDto {
  @IsNumber()
  classID: number;

  @IsNumber()
  testID: number;

  @IsString()
  date: Date;
}
