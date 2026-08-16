import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  attachmentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  attachmentType?: string;

  @IsOptional()
  @IsString()
  attachmentSize?: string;

  @IsOptional()
  @IsInt()
  replyToId?: number;
}
