import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ example: 'Rezaei', minLength: 2, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ example: 'alirezaei', minLength: 3, maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  userName: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass1!', minLength: 8, maxLength: 100 })
  @IsString()
  @Length(8, 100)
  password: string;

  @ApiProperty({ example: '09123456789', pattern: '^09\\d{9}$' })
  @Matches(/^09\d{9}$/, {
    message: 'Mobile number is invalid.',
  })
  mobile: string;

  @ApiProperty({
    description: '1 = student, 2 = teacher, 3 = admin',
    example: 1,
    enum: [1, 2, 3],
  })
  @IsIn([1, 2, 3], { message: 'Role_Id must be 1 (student), 2 (teacher) or 3 (admin).' })
  roleId: number;
}
