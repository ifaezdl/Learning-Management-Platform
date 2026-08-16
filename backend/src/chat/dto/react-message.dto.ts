import { IsIn } from 'class-validator';

export const ALLOWED_REACTIONS = ['👍', '❤️', '😮', '😂', '😢', '🎉'] as const;

export class ReactMessageDto {
  @IsIn(ALLOWED_REACTIONS)
  reaction: string;
}
