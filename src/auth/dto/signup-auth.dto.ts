import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignupAuthDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password: string;
}
