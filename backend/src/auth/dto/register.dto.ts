import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @Matches(/^09\d{9}$/, {
    message: 'Mobile number is invalid.',
  })
  mobile: string;
}
