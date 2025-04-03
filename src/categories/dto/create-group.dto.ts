// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order: number | null;
}
