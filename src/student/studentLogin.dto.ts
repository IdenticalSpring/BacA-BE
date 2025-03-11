import { IsString } from 'class-validator';

export class StudentLoginDto {
  @IsString()
  username: string;
  @IsString()
  password: string;
}
