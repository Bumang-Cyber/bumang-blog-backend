import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  Patch,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from './const/roles.const';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { IsOwnerGuard } from 'src/auth/guards/is-owner.guard';
import { IsOwner } from 'src/auth/decorators/is-owner.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get() // 200 OK
  async findAllUser() {
    return await this.usersService.findAllUser();
  }

  // 유저 한 명 찾기
  @UseGuards(JwtAuthGuard)
  @Get(':id') // 200 OK
  async findOneUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneUserById(id);

    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post() // 201 created
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, IsOwnerGuard)
  @IsOwner('user')
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return plainToInstance(UserEntity, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @HttpCode(204) // "성공했으면 됐지, 딱히 줄 건 없어" → 204. 바디는 따로 없어야 함.
  @Delete(':id')
  async removeUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.removeUser(id);
  }
}
