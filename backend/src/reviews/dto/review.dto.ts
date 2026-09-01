import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'رتینگ (۱ تا ۵)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  Rating: number;

  @ApiProperty({
    description: 'متن نظر (اختیاری)',
    example: 'این دوره فوق‌العاده بود!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  Comment?: string;
}

export class UpdateReviewDto {
  @ApiProperty({
    description: 'رتینگ جدید (اختیاری)',
    example: 4,
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  Rating?: number;

  @ApiProperty({
    description: 'متن نظر جدید (اختیاری)',
    example: 'تغیر نظر دادم، خیلی خوبه!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  Comment?: string;
}
