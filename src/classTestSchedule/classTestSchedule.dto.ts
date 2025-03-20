import { IsNumber, IsString } from 'class-validator';

export class CreateClassTestScheduleDto {
  @IsNumber()
  classID: number;
  @IsString()
  date: Date;
}
