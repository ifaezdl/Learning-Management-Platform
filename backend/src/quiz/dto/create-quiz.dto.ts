import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO برای ایجاد یک آزمون جدید (بدون بانک سوال).
 * بانک سوالات بعداً از طریق PUT /quizzes/:quizId اضافه می‌شود.
 */
export class CreateQuizDto {
  @ApiProperty({ example: 'آزمون هفته اول', description: 'عنوان آزمون' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '2026-09-01T09:00:00.000Z',
    description: 'زمان شروع آزمون (ISO 8601)',
  })
  @IsDateString()
  startAt: string;

  @ApiProperty({
    example: '2026-09-07T23:59:00.000Z',
    description: 'زمان پایان آزمون (ISO 8601)',
  })
  @IsDateString()
  endAt: string;

  @ApiProperty({ example: 30, description: 'مدت زمان آزمون به دقیقه' })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ example: 10, description: 'حداقل نمره برای قبولی' })
  @IsNumber()
  @Min(0)
  passScore: number;

  @ApiProperty({
    example: 10,
    description: 'تعداد سوالی که به هر کاربر نمایش داده می‌شود',
  })
  @IsInt()
  @Min(1)
  questionsToShow: number;

  @ApiPropertyOptional({
    example: false,
    description: 'نمایش همه سوالات یک‌جا (در مقابل یکی‌یکی)',
  })
  @IsOptional()
  @IsBoolean()
  showAllQuestions?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'اجازه بازگشت به سوال قبلی',
  })
  @IsOptional()
  @IsBoolean()
  allowPreviousQuestion?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'نمره پیش‌فرض هر سوال' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  scorePerQuestion?: number;
}
