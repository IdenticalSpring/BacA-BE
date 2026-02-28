import { IsString, IsOptional } from 'class-validator';

export class StudentLoginDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password?: string;
}
