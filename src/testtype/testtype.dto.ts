import { IsString } from 'class-validator';

export class CreateTestTypeDto {
  @IsString()
  name: string;
}

export class UpdateTestTypeDto {
  @IsString()
  name?: string;
}
