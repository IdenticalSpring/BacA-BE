import { IsOptional, IsString } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  type: number;

  @IsString()
  name: string;
}
export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  type: number;

  @IsString()
  name: string;
}
