import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateGroupDto } from './dto/create-group.dto';

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
}
