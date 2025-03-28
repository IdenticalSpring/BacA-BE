import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateUserNotificationDto {
  @IsBoolean()
  status: boolean;
  @IsInt()
  studentID: number;
  @IsInt()
  notificationID: number;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}

export class UpdateUserNotificationDto {
  @IsOptional()
  @IsBoolean()
  status: boolean;
  @IsOptional()
  @IsInt()
  studentID: number;
  @IsOptional()
  @IsInt()
  notificationID: number;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;
}
