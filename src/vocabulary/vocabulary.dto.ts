import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateVocabularyDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;
  @IsOptional()
  @IsString()
  audioUrl?: string;
  @IsOptional()
  @IsString()
  textToSpeech: string;
  @IsOptional()
  @IsBoolean()
  isDelete: boolean;
  @IsInt()
  homeworkId: number;
  @IsInt()
  @IsOptional()
  studentId?: number;
}

export class UpdateVocabularyDto extends CreateVocabularyDto {}
export class FindByStudentAndHomework {
  @IsInt()
  homeworkId: number;
  @IsInt()
  studentId: number;
}
