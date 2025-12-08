import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { SenderRole } from './chat.entity';

export class CreateChatDto {
  @IsNumber()
  classId: number;

  @IsOptional()
  @IsNumber()
  studentId?: number;

  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @IsOptional()
  @IsString()
  message?: string;

  // *** THÊM TRƯỜNG NÀY ***
  @IsEnum(['student', 'teacher'])
  senderRole: SenderRole;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAI?: boolean;
}

export class RevokeChatDto {
  @IsNumber()
  chatId: number;

  @IsBoolean()
  isRevoked: boolean;
}
