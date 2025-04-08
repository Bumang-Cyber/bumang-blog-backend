import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagsEntity } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(TagsEntity)
    private readonly tagRepo: Repository<TagsEntity>,
  ) {}

  // 1. 태그 생성
  async createTag(createTagDto: CreateTagDto) {
    const { title } = createTagDto;

    const existingTitle = await this.tagRepo.findOne({
      where: { title },
    });

    if (existingTitle) {
      throw new ConflictException('This tag title is already in use');
    }

    return await this.tagRepo.save({
      title,
    });
  }

  // 2. 모든 태그 조회
  async findAllTag() {
    const tags = await this.tagRepo.find({
      order: { id: 'ASC' },
    });

    return tags;
  }

  // 3. 태그 하나 조회
  async findOneTag(id: number) {
    const tag = await this.tagRepo.findOne({
      where: { id },
      relations: ['posts'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  // 4. 태그 업데이트
  async updateOneTag(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.tagRepo.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // dto에 title이 있다면
    if (updateTagDto.title) {
      const existingTitle = await this.tagRepo.findOne({
        where: { title: updateTagDto.title },
      });

      if (existingTitle && existingTitle.id !== id) {
        throw new ConflictException('This tag title is already in use');
      }
    }

    return await this.tagRepo.save({
      id,
      ...updateTagDto,
    });
  }

  // 5. 태그 삭제
  async removeOneTag(id: number) {
    const tag = await this.tagRepo.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    await this.tagRepo.remove(tag);
  }
}
