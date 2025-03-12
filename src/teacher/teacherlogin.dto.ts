import { IsString } from 'class-validator';

export class TeacherLoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
