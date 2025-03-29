import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAllUser();
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    return await this.usersService.removeUser(+id);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return plainToInstance(UserEntity, user);
  }

  @Patch()
  async patchUser(@Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(updateUserDto);
    return plainToInstance(UserEntity, user);
  }
}
