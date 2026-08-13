import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateInstructorRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  resumeUrl?: string;
}
