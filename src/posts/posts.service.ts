import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { TagsEntity } from 'src/tags/entities/tag.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { extractPreviewText } from 'src/common/util/extractPreviewText';
import { PostListItemResponseDto } from './dto/post-list-item-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/pagenated-response.dto';
import { CreatePostResponseDto } from './dto/create-post-response.dto';
import { UpdatePostResponseDto } from './dto/update-post-response.dto';
import { DeletePostResponseDto } from './dto/delete-post-response.dto';
import { canReadPost } from './util/canReadPost';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { canCreateOrUpdatePost } from './util/canCreateOrUpdatePost';

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
  async findPosts(
    page: number,
    size: number,
    filter: {
      groupId?: number;
      categoryId?: number;
      tagIds?: number[];
    },
  ): Promise<PaginatedResponseDto<PostListItemResponseDto>> {
    const { groupId, categoryId, tagIds } = filter;

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('category.group', 'group')
      .leftJoinAndSelect('post.tags', 'tag');

    if (groupId) {
      query.where('group.id = :groupId', { groupId });
    } else if (categoryId) {
      query.where('category.id = :categoryId', { categoryId });
    } else if (Array.isArray(tagIds) && tagIds.length !== 0) {
      // 기존: query.where('tag.id = :tagIds', { tagIds });
      query.where('tag.id IN (:...tagIds)', { tagIds });
    }

    query.orderBy('post.id', 'DESC');

    // ✅ pagination 적용
    query.skip((page - 1) * size).take(size);

    // ✅ get [data, totalCount]
    const [posts, totalCount] = await query.getManyAndCount();

    const postDtos = posts.map(PostListItemResponseDto.fromEntity);

    return new PaginatedResponseDto(totalCount, size, page, postDtos);
  }

  // 5. 특정 포스트 생성
  async createPost(
    createPostDto: CreatePostDto,
  ): Promise<CreatePostResponseDto> {
    const { title, content, authorId, categoryId, tagIds, readPermission } =
      createPostDto;

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

    // JSON -> 맨 첫 문장
    const previewText = extractPreviewText(content); // blocks에서 첫 문장 뽑는 함수

    const post = this.postRepo.create({
      title,
      content,
      previewText,
      readPermission,
      author: existingAuthor,
      category: existingCategory,
      tags: validTags,
      comments: [],
    });

    await this.postRepo.save(post);

    return CreatePostResponseDto.fromEntity(post);
  }

  // 6. 특정 포스트 상세 조회
  async findPostDetail(id: number, currentUser: CurrentUserDto | null) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['category', 'comments', 'tags', 'category.group', 'author'],
      order: { id: 'DESC' },
    });

    if (!post) {
      throw new NotFoundException('Post were not found');
    }

    const userRole = currentUser?.role || null;
    if (!canReadPost(post.readPermission, userRole)) {
      //
      throw new ForbiddenException(
        'You do not have permission to view this post.',
      );
    }

    return post;
  }

  // 7. 특정 포스트 수정
  async updatePost(
    id: number,
    dto: UpdatePostDto,
    currentUser: CurrentUserDto | null,
  ): Promise<UpdatePostResponseDto> {
    const { title, content, categoryId, tagIds, readPermission } = dto;

    // 아이디로 조회
    const existingPost = await this.postRepo.findOne({
      where: { id },
      relations: ['category', 'comments', 'tags', 'category.group'],
    });

    if (!existingPost) {
      throw new NotFoundException();
    }

    const userRole = currentUser?.role || null;
    if (!canCreateOrUpdatePost(existingPost.readPermission, userRole)) {
      throw new ForbiddenException(
        'You do not have permission to update this post.',
      );
    }

    if (typeof title !== 'string' || title === '') {
      throw new BadRequestException('Invalid Title');
    }

    existingPost.title = title;

    if (typeof content !== 'string' || content === '') {
      throw new BadRequestException('Invalid Content');
    }

    existingPost.content = content;

    const existingCategory = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException(
        `Category with ID ${categoryId} does not exist`,
      );
    }

    existingPost.category = existingCategory;

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

    existingPost.tags = validTags;

    if (readPermission !== undefined) {
      existingPost.readPermission = readPermission;
    }

    await this.postRepo.save(existingPost);

    return UpdatePostResponseDto.fromEntity(existingPost);
  }

  // 8. 특정 포스트 삭제
  async deletePost(id: number) {
    const existingPost = await this.postRepo.findOne({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} does not exist`);
    }

    await this.postRepo.remove(existingPost);

    return DeletePostResponseDto.fromEntity(existingPost);
  }
}
