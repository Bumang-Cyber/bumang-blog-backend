import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
import { PostDetailResponseDto } from './dto/post-detail-response.dto';

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

    return PostDetailResponseDto.fromEntity(post);
  }

  // 6. (내부용RAW) 특정 포스트 상세 조회
  async findPostDetailRaw(id: number, currentUser: CurrentUserDto | null) {
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

  // 9. 관련 포스트 조회
  // async findRelatedPosts(postId: number): Promise<PostListItemResponseDto[]> {
  //   const targetPost = await this.postRepo.findOne({
  //     where: { id: postId },
  //     relations: ['tags', 'category', 'category.group'], // 태그, 카테고리, 그룹 가져오기
  //   });

  //   // 아이디 추출
  //   const tagIds = targetPost.tags.map((tag) => tag.id);
  //   const categoryId = targetPost.category.id;
  //   const groupId = targetPost.category.group.id;

  //   // 결과를 가져올 배열 생성
  //   const result: PostEntity[] = [];

  //   // 1. 같은 태그
  //   // 테이블 설정 -> join -> where -> take -> get...
  //   if (tagIds.length) {
  //     const postsByTag = await this.postRepo
  //       .createQueryBuilder('post') // post 테이블 기준으로 쿼리 빌드 시작
  //       .leftJoin('post.tags', 'tag') // post.tags와 LEFT JOIN (다대다 관계), 연결된 tag의 정보를 참조 가능한 상태로 만든다.
  //       .where('tag.id IN (:...tagIds)', { tagIds }) // 현재 포스트의 태그 ID 중 하나라도 포함된 포스트, :가 붙으면 모두 변수로 생각하기
  //       .andWhere('post.id != :id', { id: postId }) // 자기 자신은 제외 (중복 방지), &&를 안 쓰고 나눠서 조건주기 위해서 andWhere 사용
  //       .take(3) // 최대 3개만 가져오기
  //       .getMany(); // 실제 데이터 가져오기

  //     result.push(...postsByTag);
  //   }

  //   if (result.length < 3) {
  //     const postsByCategory = await this.postRepo.find({
  //       where: {
  //         category: { id: categoryId },
  //         id: Not(postId), // 자기자신 제외
  //       },
  //       take: 3 - result.length,
  //     });

  //     result.push(...postsByCategory);
  //   }

  //   // post → category → group 까지 관계 traversal 필요 => 쿼리빌더로 처리하는게 성능 좋음
  //   // 테이블 설정 -> join -> where -> take -> get...
  //   if (result.length < 3) {
  //     const postsByGroup = await this.postRepo
  //       .createQueryBuilder('post') // post 테이블 기준으로 쿼리 빌드
  //       .leftJoin('post.category', 'category') // post.category와 LEFT JOIN, category를 참조 가능하도록 불러온다.
  //       .leftJoin('category.group', 'group') // category.group과 다시 LEFT JOIN, group을 참조 가능하도록 불러온다.
  //       .where('group.id = :groupId', { groupId }) // 기준 포스트와 같은 그룹 ID를 가진 글만 대상
  //       .andWhere('post.id != :id', { id: postId }) // 자기 자신은 제외
  //       .take(3 - result.length) // 남은 개수만큼만 가져오기
  //       .getMany(); // 실제 포스트 리스트 가져오기

  //     result.push(...postsByGroup);
  //   }

  //   return result.slice(0, 3).map(PostListItemResponseDto.fromEntity); // 혹시라도 중복방지
  // }

  async findRelatedPosts(postId: number): Promise<PostListItemResponseDto[]> {
    const targetPost = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['tags', 'category', 'category.group'],
    });

    const tagIds = targetPost.tags.map((tag) => tag.id);
    const categoryId = targetPost.category.id;
    const groupId = targetPost.category.group.id;

    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoin('post.tags', 'tag')
      .leftJoin('post.category', 'category')
      .leftJoin('category.group', 'group')
      .where('post.id != :id', { id: postId }) // 자기 제외
      .andWhere('post.readPermission IS NULL') // 🔒 퍼블릭 제한 등 조건 넣어도 됨. => readPermission null인 것만 OK!
      .select('post.id', 'id') // id라는 컬럼으로 post.id 가져옴
      .addSelect('post.title', 'title') // title이라는 컬럼으로 post.title 가져옴
      .addSelect('post.previewText', 'previewText') // previewText이라는 컬럼으로 post.previewText 가져옴
      .addSelect('post.createdAt', 'createdAt')
      .addSelect('category.label', 'categoryLabel') // 이미 leftJoin했으니 가능
      .addSelect('group.label', 'groupLabel') // 이미 leftJoin했으니 가능
      .addSelect('post.author', 'author')
      .addSelect('post.readPermission', 'readPermission')
      .addSelect(
        // 유사도 점수 계산: 태그 겹친 수 * 10 + 카테고리 일치 시 5점 + 그룹 일치 시 1점
        `
        COUNT(DISTINCT tag.id) * 10 +
        CASE WHEN category.id = :categoryId THEN 5 ELSE 0 END +
        CASE WHEN group.id = :groupId THEN 1 ELSE 0 END
        `, // DISTINCT는 중복을 허용하지 않는다는 뜻.
        'score',
      )
      .groupBy('post.id')
      .addGroupBy('category.id')
      .addGroupBy('group.id')
      .orderBy('score', 'DESC')
      .limit(3)
      .setParameters({ categoryId, groupId, tagIds });

    const relatedPosts = await query.getRawMany();

    return relatedPosts
      .sort((a, b) => b.score - a.score)
      .map((post) => ({ ...post, score: Number(post.score) }));
  }

  async addLikes(postId: number) {
    // 존재 여부 확인
    const existingPost = await this.postRepo.findOne({ where: { id: postId } });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${postId} does not exist`);
    }

    // PostgreSQL에서 직접 증가 (동시성 안전)
    const result = await this.postRepo
      .createQueryBuilder()
      .update()
      .set({ likes: () => 'likes + 1' }) // ← 꼭 따옴표 필요: "likes"는 컬럼명. 원자성을 가지는 태스크
      .where('id = :id', { id: postId })
      .returning('likes') // PostgreSQL에서 현재 값 반환
      .execute();

    return { id: postId, likes: result.raw[0].likes };
  }

  async addView(postId: number) {
    const existingPost = await this.postRepo.findOne({ where: { id: postId } });

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${postId} does not exist`);
    }

    // PostgreSQL에서 직접 증가 (동시성 안전)
    const result = await this.postRepo
      .createQueryBuilder()
      .update() // 업데이트문으로 전환
      .set({ view: () => 'view + 1' }) // 업데이트할 컬럼과 업데이트 로직
      .where('id = :id', { id: postId })
      .returning('view') // 따로 select문을 쓰지 않아도 현재 값 반환. POSTGRESQL의 고유 문법
      .execute();

    return { id: postId, view: result.raw[0].view };
  }
}
