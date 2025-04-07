import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateStudentSkillBehaviorScoreDto {
  @IsInt()
  teacherCommentID: number;

  @IsInt()
  studentID: number;

  @IsInt()
  skillID: number;

  @IsString()
  skillType: string;

  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @IsDateString() // Thêm trường date
  date: string;
}

export class UpdateStudentSkillBehaviorScoreDto {
  @IsOptional()
  @IsInt()
  teacherCommentID?: number;

  @IsOptional()
  @IsInt()
  studentID?: number;

  @IsOptional()
  @IsInt()
  skillID?: number;

  @IsOptional()
  @IsString()
  skillType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsDateString() // Thêm trường date
  date?: string;
}
