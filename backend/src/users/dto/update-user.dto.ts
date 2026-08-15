import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ali', minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rezaei', minLength: 2, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'alirezaei', minLength: 3, maxLength: 50 })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  userName?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '09123456789', pattern: '^09\\d{9}$' })
  @IsOptional()
  @Matches(/^09\d{9}$/, {
    message: 'Mobile number is invalid.',
  })
  mobile?: string;

  @ApiPropertyOptional({
    description: 'New password (only sent when the admin wants to reset it)',
    minLength: 8,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(8, 100)
  password?: string;

  @ApiPropertyOptional({
    description: '1 = student, 2 = teacher, 3 = admin',
    enum: [1, 2, 3],
  })
  @IsOptional()
  @IsIn([1, 2, 3], { message: 'Role_Id must be 1 (student), 2 (teacher) or 3 (admin).' })
  roleId?: number;

  @ApiPropertyOptional({ description: 'Whether the user account is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
