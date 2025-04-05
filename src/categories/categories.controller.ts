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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  @Post('groups')
  async createOneGroup(@Body() { label, order = null }: CreateGroupDto) {
    return await this.categoriesService.creeateOneGroup({ label, order });
  }

  @Patch('groups')
  async updateOneGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() { label, order = null }: UpdateGroupDto,
  ) {
    return await this.categoriesService.updateOneGroup(id, { label, order });
  }

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

  @Patch(':id')
  async updateOneCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() { label, order, groupId }: UpdateCategoryDto,
  ) {
    console.log(id, label, order, groupId, '???');
    return await this.categoriesService.updateOneCategory(id, {
      label,
      order,
      groupId,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteOneCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteOneCategory(id);
  }
}
