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

export class QuizChoiceDto {
  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class QuizQuestionDto {
  @IsString()
  questionText: string;

  @IsOptional()
  @IsBoolean()
  isAiGenerated?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QuizChoiceDto)
  choices: QuizChoiceDto[];
}

export class SaveQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  scorePerQuestion?: number;

  @IsNumber()
  @Min(0)
  passScore: number;

  @IsInt()
  @Min(1)
  questionsToShow: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
