import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateHomeWorkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  linkYoutube?: string;
  @IsOptional()
  @IsString()
  linkGame?: string;
  // @IsOptional()
  // @IsString()
  // linkSpeech: string;

  @IsOptional()
  @IsString()
  linkZalo?: string;

  // @IsOptional()
  // @IsString()
  // textToSpeech?: string;
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  level?: number; // Thêm level vào Update DTO
  @IsInt()
  teacherId: number; // Thêm level vào Update DTO

  @IsOptional()
  @IsBoolean()
  status?: boolean;
  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  @IsOptional()
  @IsDateString() // Thêm trường date
  date?: string;
}

export class UpdateHomeWorkDto extends CreateHomeWorkDto {}
export class findHomeWorkByLevelAndTeacherIdDto {
  @IsInt()
  level: number;
  @IsInt()
  teacherId: number;
}
export class textToSpeechDto {
  @IsString()
  textToSpeech: string;
  @IsOptional()
  @IsString()
  voice?: string;
  @IsOptional()
  @IsString()
  voiceSpeed?: string;
}
export class ReassignHomeWorksDto {
  // @IsInt()
  // oldTeacherId: number;

  @IsInt()
  newTeacherId: number;

  @IsArray()
  @IsInt({ each: true })
  homeWorkIds: number[];
}
