// src/message/dto/create-message.dto.ts
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  classId: number;
}
