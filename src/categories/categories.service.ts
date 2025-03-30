import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  // 1. <GET> 전체 카테고리 조회 (JSON 계층구조 표현 | raw)
  async findAllCategoryInRaw(sortType: 'tree' | 'raw' = 'tree') {
    const categories = await this.categoryRepo.find({
      relations: ['parent', 'children'],
      order: { order: 'ASC' },
    });

    return categories;
  }

  // 2. <POST> 카테고리 추가
  async createCategory(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const { label, order, parentId } = dto;
    console.log(label, order, parentId, 'label, order, parentId');
    // 1. 해당 이름의 카테고리가 이미 있는지 체크
    const existingLabel = await this.categoryRepo.findOne({ where: { label } });
    if (existingLabel) {
      throw new ConflictException('Category label is already in use'); // 409 에러를 던져줌
    }

    let parent: CategoryEntity | null = null;
    if (parentId) {
      parent = await this.categoryRepo.findOne({
        where: { id: parentId },
      });

      // parent가 없으면
      if (!parent) {
        throw new NotFoundException(`Parent category not found`); // 404 에러를 던져줌
      }
    }

    let finalOrder = order;
    if (order === null) {
      // 오더가 없다면
      const maxOrderCategory = await this.categoryRepo.findOne({
        where: { parent },
        order: { order: 'DESC' },
      });

      finalOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 1;
    } else {
      const orderedItem = await this.categoryRepo.findOne({
        where: { order, parent },
        order: { order: 'DESC' },
      });

      if (orderedItem) {
        throw new ConflictException('The Order is already in use'); // 409 에러를 던져줌
      }
    }

    const category = this.categoryRepo.create({
      label,
      order: finalOrder,
      parent,
    });
    return this.categoryRepo.save(category);
  }

  // 3. <PATCH> 카테고리 수정

  // 4. <DELETE> 카테고리 삭제

  // 5.
}
