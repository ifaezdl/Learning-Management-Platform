import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLessonProgressDto {
  @ApiProperty({
    example: true,
    description: 'Whether the student has completed this lesson',
  })
  @IsBoolean()
  isCompleted: boolean;
}
