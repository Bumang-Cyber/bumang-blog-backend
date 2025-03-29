// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { RolesEnum } from '../const/roles.const';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(RolesEnum)
  @IsNotEmpty()
  role: RolesEnum;
}
