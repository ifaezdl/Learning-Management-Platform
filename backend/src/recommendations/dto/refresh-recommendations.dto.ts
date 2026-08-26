import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RefreshRecommendationsDto {
  @ApiProperty({
    description: 'تعداد توصیه‌های برتر که باید تولید شوند',
    example: 5,
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  topN?: number = 5;
}
