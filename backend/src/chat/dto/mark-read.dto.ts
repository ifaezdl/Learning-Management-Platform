import { IsInt } from 'class-validator';

export class MarkReadDto {
  @IsInt()
  lastReadMessageId: number;
}
