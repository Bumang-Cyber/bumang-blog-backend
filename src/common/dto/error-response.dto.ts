import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 404 })
  statusCode: number;

  constructor(statusCode: number) {
    this.success = false;
    this.statusCode = statusCode;
  }
}
