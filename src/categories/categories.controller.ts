import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get() // 200 OK
  async findAllCategories() {
    return await this.categoriesService.findAllCategoryInRaw();
  }

  @Post() // 201 created
  async createCategory(
    @Body() { label, order = null, parentId = null }: CreateCategoryDto,
  ) {
    return await this.categoriesService.createCategory({
      label,
      order,
      parentId,
    });
  }
}
