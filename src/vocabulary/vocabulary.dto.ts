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
  homeworkId: number; // Thêm level vào Update DTO
}

export class UpdateVocabularyDto extends CreateVocabularyDto {}
