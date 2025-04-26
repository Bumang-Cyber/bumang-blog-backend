import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from 'src/users/const/roles.const';

export class CurrentUserDto {
  @ApiProperty({ example: 10 })
  userId: number;

  @ApiProperty({ example: 'calmness0729@gmail.com' })
  email: string;

  @ApiProperty()
  role: RolesEnum;
}
