import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO برای ویرایش آزمون — تنظیمات + بانک سوالات کامل.
 * ارسال آرایه questions باعث بازنویسی کامل بانک سوالات همان آزمون می‌شود
 * بدون اینکه آزمون‌های دیگر دوره دست‌خورده شوند.
 */

export class UpdateQuizChoiceDto {
  @ApiPropertyOptional({ example: 'گزینه الف' })
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class UpdateQuizQuestionDto {
  @ApiPropertyOptional({ example: 'متن سوال شماره یک چیست؟' })
  @IsString()
  questionText: string;

  @ApiPropertyOptional({ example: 'مدیریت حافظه' })
  @IsOptional()
  @IsString()
  skillTag?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAiGenerated?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateQuizChoiceDto)
  choices: UpdateQuizChoiceDto[];
}

export class UpdateQuizDto {
  @ApiPropertyOptional({ example: 'آزمون هفته اول - ویرایش شده' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '2026-09-01T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-09-07T23:59:00.000Z' })
  @IsOptional()
  @IsDateString()
  endAt?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  scorePerQuestion?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  passScore?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  questionsToShow?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  showAllQuestions?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowPreviousQuestion?: boolean;

  /** آرایه کامل سوالات — اگر ارسال شود، بانک سوالات کاملاً بازنویسی می‌شود */
  @ApiPropertyOptional({ type: [UpdateQuizQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuizQuestionDto)
  questions?: UpdateQuizQuestionDto[];
}
