import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { TagsEntity } from 'src/tags/entities/tag.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(TagsEntity)
    private readonly tagRepo: Repository<TagsEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
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
  async createPost(createPostDto: CreatePostDto) {
    const { title, content, authorId, categoryId, tagIds } = createPostDto;

    const existingAuthor = await this.userRepo.findOne({
      where: { id: authorId },
    });

    if (!existingAuthor) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }

    const existingCategory = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    let validTags: TagsEntity[] = [];
    if (tagIds && tagIds.length > 0) {
      // 순회가 끝난 다음에 Promise.all(...)이 resolve or reject를 시작..
      // 그러므로 순회 중에 Promise<TagEntity>가 반환되면 에러나는거 아닌가? 생각할 필요 x
      const tags = await Promise.all(
        tagIds.map((id) => this.tagRepo.findOne({ where: { id } })),
      );

      // 타입만 확정시킴
      validTags = tags.filter((tag): tag is TagsEntity => !!tag);

      // 유효하지 않은 태그가 있었다고 한다면...
      if (validTags.length !== tagIds.length) {
        throw new NotFoundException('Some tags were not found');
      }
    }

    const post = this.postRepo.create({
      title,
      content,
      author: existingAuthor,
      category: existingCategory,
      tags: validTags,
      comments: [],
    });

    return this.postRepo.save(post);
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
