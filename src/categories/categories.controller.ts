import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * @GROUPS
   */
  @Get('groups')
  async findAllGroups() {
    return await this.categoriesService.findAllGroupRaw();
  }

  @Get('groups/:id')
  async findOneGroups(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.findOneGroup(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post('groups')
  async createOneGroup(@Body() { label, order = null }: CreateGroupDto) {
    return await this.categoriesService.creeateOneGroup({ label, order });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Patch('groups')
  async updateOneGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() { label, order = null }: UpdateGroupDto,
  ) {
    return await this.categoriesService.updateOneGroup(id, { label, order });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Delete('groups/:id')
  @HttpCode(204)
  async deleteOneGroup(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteOneGroup(id);
  }

  /**
   * @CATEGORIES
   */
  @Get() // 200 OK
  async findAllCategories() {
    return await this.categoriesService.findAllCategoryRaw();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Post() // 201 created
  async createOneCategory(
    @Body() { label, order = null, groupId = null }: CreateCategoryDto,
  ) {
    return await this.categoriesService.createOneCategory({
      label,
      order,
      groupId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Patch(':id')
  async updateOneCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() { label, order, groupId }: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateOneCategory(id, {
      label,
      order,
      groupId,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async deleteOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteOneCategory(id);
  }
}
