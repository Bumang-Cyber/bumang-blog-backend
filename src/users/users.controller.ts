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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() // 200 OK
  async findAllUser() {
    return await this.usersService.findAllUser();
  }

  @Get(':id') // 200 OK
  async findOneUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneUser(id);

    return plainToInstance(UserEntity, user);
  }

  @Post() // 201 created
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(UserEntity, user);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return plainToInstance(UserEntity, user);
  }

  @HttpCode(204) // "성공했으면 됐지, 딱히 줄 건 없어" → 204. 바디는 따로 없어야 함.
  @Delete(':id')
  async removeUser(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.removeUser(id);
  }
}
