import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  // 1. 포스트 모두 조회
  // 2. 특정 카테고리의 포스트 조회 (pagenation)
  // 3. 특정 그룹의 포스트 조회 (pagenation)
  // 4. 특정 태그의 포스트 조회 (pagenation)
  async findAllPosts(filter: {
    groupId?: number;
    categoryId?: number;
    tagId?: number;
  }) {
    const { groupId, categoryId, tagId } = filter;

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('category.group', 'group')
      .leftJoinAndSelect('post.tags', 'tag');

    if (groupId) {
      query.where('group.id = :groupId', { groupId });
    } else if (categoryId) {
      query.where('category.id = :categoryId', { categoryId });
    } else if (tagId) {
      query.where('tag.id = :tagId', { tagId });
    }

    query.orderBy('post.id', 'DESC');

    return query.getMany();
  }

  // 5. 특정 포스트 생성
  async createPost(createPostsDto: CreatePostDto) {
    const { title, content, authorId, categoryId, tagIds } = createPostsDto;
    console.log(title, content, authorId, categoryId, tagIds);

    return;
  }

  // 6. 특정 포스트 상세 조회
  async findPostDetail() {
    const groups = await this.postRepo.find({
      relations: ['category'],
      order: { id: 'DESC' },
    });

    return groups;
  }

  // 7. 특정 포스트 수정
  async updatePost() {
    const groups = await this.postRepo.find({
      relations: ['category'],
      order: { id: 'DESC' },
    });

    return groups;
  }

  // 7. 특정 포스트 삭제
  async deletePost() {
    return;
  }
}
