import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

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
}
