import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class CreateStudentVocabularyDto {
  @IsString()
  text: string;

  @IsInt()
  vocabularyId: number;
  @IsInt()
  studentId: number;
  @IsInt()
  homeworkId: number;
}

export class UpdateStudentVocabularyDto extends CreateStudentVocabularyDto {}
export class findAllStudentVocabulariesByHomeworkIdAndStudentIdDto {
  @IsInt()
  homeworkId: number;
  @IsInt()
  studentId: number;
}
