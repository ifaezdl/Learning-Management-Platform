import { IsInt, Min, Max } from 'class-validator';

export class GenerateQuizDto {
  @IsInt()
  @Min(1)
  @Max(100)
  count: number;
}
