import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

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

  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class RevokeChatDto {
  @IsNumber()
  chatId: number;

  @IsBoolean()
  isRevoked: boolean;
}
