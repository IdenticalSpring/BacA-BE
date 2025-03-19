import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateTeacherCommentOnStudentDto {
  @IsInt()
  teacherID: number;

  @IsInt()
  studentID: number;

  @IsInt()
  scheduleID: number;

  @IsString()
  comment: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  // ✅ Đánh giá kỹ năng (0-4 sao)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  vocabulary?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  structure?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  listening?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  speaking?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  reading?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  writing?: number;

  // ✅ Đánh giá hành vi (0-4 sao)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  respect?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  discipline?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  cooperation?: number;
}

export class UpdateTeacherCommentOnStudentDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isDelete?: boolean;

  // ✅ Đánh giá kỹ năng (cho phép cập nhật từng phần)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  vocabulary?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  structure?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  listening?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  speaking?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  reading?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  writing?: number;

  // ✅ Đánh giá hành vi (cho phép cập nhật từng phần)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  respect?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  discipline?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  cooperation?: number;
}
