import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly categoryRepo: Repository<PostEntity>,
  ) {}

  async findAllPosts() {
    const groups = await this.categoryRepo.find({
      relations: ['category,'],
      order: { id: 'DESC' },
    });

    return groups;
  }

  async findCategorizedPosts() {
    const groups = await this.categoryRepo.find({
      relations: ['category,'],
      order: { id: 'DESC' },
    });

    return groups;
  }
}
