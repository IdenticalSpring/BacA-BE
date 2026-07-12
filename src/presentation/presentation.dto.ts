import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SavePresentationDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonByScheduleId?: number;

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(26_214_400)
  contentJson?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(1_048_576)
  metadataJson?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: 'vi' | 'en';
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  thumbnailUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  tags?: Array<string | { name: string; category?: string }>;
}

export class CreatePresentationShareDto {
  @IsOptional()
  @IsIn(['read', 'edit_copy'])
  permission?: 'read' | 'edit_copy';

  @IsOptional()
  @IsBoolean()
  canDownload?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdatePresentationShareDto extends CreatePresentationShareDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssetMetadataDto {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(1_048_576)
  metadataJson?: string;
}

export class CreatePptTagDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

export class UpdatePresentationTagsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  tags?: Array<string | { name: string; category?: string }>;
}

export class GeneratePresentationOutlineDto {
  @IsString()
  @MaxLength(500)
  topic: string;

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: 'vi' | 'en';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  level?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  lessonName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  tags?: Array<string | { name: string; category?: string }>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  slideCount?: number;
}

export class GeneratePresentationSlidesDto extends GeneratePresentationOutlineDto {
  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  outline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  style?: string;
}

export class RewritePresentationTextDto {
  @IsString()
  @MaxLength(10_000)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  command?: string;

  @IsOptional()
  @IsIn(['vi', 'en'])
  language?: 'vi' | 'en';
}
