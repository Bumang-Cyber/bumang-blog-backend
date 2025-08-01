import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsOwner } from 'src/auth/decorators/is-owner.decorator';
import { IsOwnerGuard } from 'src/auth/guards/is-owner.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PostListItemResponseDto } from './dto/post-list-item-response.dto';
import { PaginatedResponseDto } from 'src/common/dto/pagenated-response.dto';
import { CreatePostResponseDto } from './dto/create-post-response.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt.guard';

@ApiBearerAuth()
@ApiTags('Posts') // Swagger UI 그룹 이름
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('test')
  @ApiExcludeEndpoint() // 스웨거에 제외
  findAll() {
    return [{ id: 1, title: '0426 05:28PM' }];
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: '모든 게시글 조회',
    description: 'DB에 있는 모든 게시글 목록을 반환합니다.',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: '그룹 아이디로 조회 시',
    type: 'number',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: '최대 개수',
    type: 'number',
  })
  @ApiQuery({
    name: 'tagIds',
    required: false,
    description: '태그 아이디로 조회 (중첩 가능)',
    example: 'number[]',
    type: 'number[]',
  })
  async findAllPostsPublic(
    @CurrentUser() user?: CurrentUserDto,
    @Query('groupId') groupId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagIds') tagIds?: string[],
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe)
    pageSize?: number,
    @Query('pageIndex', new DefaultValuePipe(1), ParseIntPipe)
    pageIndex?: number,
    @Query('type') type?: string,
  ): Promise<PaginatedResponseDto<PostListItemResponseDto>> {
    const parsedGroupId = groupId !== undefined ? +groupId : undefined;
    const parsedCategoryId = categoryId !== undefined ? +categoryId : undefined;

    if (typeof groupId !== 'undefined' && isNaN(parsedGroupId)) {
      throw new BadRequestException('groupId must be a number');
    }
    if (typeof categoryId !== 'undefined' && isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId must be a number');
    }

    // tagsId같은 경우 연달아 여러 개 쓰면 배열로 처리됨.
    const validatedTags = Array.isArray(tagIds)
      ? tagIds.filter(Boolean)
      : tagIds
        ? [tagIds]
        : [];
    const parsedTagIds = validatedTags
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    return await this.postsService.findPostsPublic(
      pageIndex, //
      pageSize,
      {
        groupId: parsedGroupId,
        categoryId: parsedCategoryId,
        tagIds: parsedTagIds,
        type: type,
      },
      user || null,
    );
  }

  @Get('authenticated')
  @ApiOperation({
    summary: '모든 게시글 조회',
    description: 'DB에 있는 모든 게시글 목록을 반환합니다.',
  })
  @ApiResponse({
    description: '최근 결제가 만료된 유저 목록',
    type: PaginatedResponseDto<PostListItemResponseDto>,
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAllPostsAuthenticated(
    @CurrentUser() user?: CurrentUserDto,
    @Query('groupId') groupId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagIds') tagIds?: string[],
    @Query('pageSize', new DefaultValuePipe(12), ParseIntPipe)
    pageSize?: number,
    @Query('pageIndex', new DefaultValuePipe(1), ParseIntPipe)
    pageIndex?: number,
    @Query('type') type?: string,
  ): Promise<PaginatedResponseDto<PostListItemResponseDto>> {
    const parsedGroupId = groupId !== undefined ? +groupId : undefined;
    const parsedCategoryId = categoryId !== undefined ? +categoryId : undefined;

    if (typeof groupId !== 'undefined' && isNaN(parsedGroupId)) {
      throw new BadRequestException('groupId must be a number');
    }
    if (typeof categoryId !== 'undefined' && isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId must be a number');
    }

    // tagsId같은 경우 연달아 여러 개 쓰면 배열로 처리됨.
    const validatedTags = Array.isArray(tagIds)
      ? tagIds.filter(Boolean)
      : tagIds
        ? [tagIds]
        : [];
    const parsedTagIds = validatedTags
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    return await this.postsService.findPostsAuthenticated(
      pageIndex, //
      pageSize,
      {
        groupId: parsedGroupId,
        categoryId: parsedCategoryId,
        tagIds: parsedTagIds,
        type: type,
      },
      user || null,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  @ApiOperation({
    summary: '게시글 생성',
    description: 'DB에 게시글을 저장합니다.',
  })
  @ApiBody({ type: CreatePostDto }) // 요청 바디 스웨거 문서
  @ApiCreatedResponse({ type: CreatePostResponseDto }) // 201 Created용 스웨거 데코레이터
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user?: CurrentUserDto,
  ): Promise<CreatePostResponseDto> {
    return await this.postsService.createPost(createPostDto, user || null);
  }

  @Get(':id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글을 상세 조회합니다.',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findPostDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    return await this.postsService.findPostDetail(id, user || null);
  }

  @Get(':id/related')
  @ApiOperation({
    summary: '관련된 포스트 조회',
    description: '특정 게시물에 관련된 포스트를 세 개 조회합니다.',
  })
  async findRelatedPosts(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostListItemResponseDto[]> {
    return await this.postsService.findRelatedPosts(id);
  }

  @Get(':id/adjacent')
  @ApiOperation({
    summary: '인접 포스트 조회',
    description: '특정 게시물의 인접 포스트를 조회합니다.',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async findAdjacentPosts(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: CurrentUserDto,
  ): Promise<{
    previous: PostListItemResponseDto;
    next: PostListItemResponseDto;
  }> {
    return await this.postsService.findAdjacentPosts(id, user || null);
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('post')
  @Patch(':id')
  @ApiOperation({
    summary: '게시글 수정',
    description: '특정 게시글을 수정합니다.',
  })
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    return await this.postsService.updatePost(id, updatePostDto, user || null);
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('post')
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: '게시글 삭제',
    description: '특정 게시글을 삭제합니다.',
  })
  async removeOnePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: CurrentUserDto,
  ) {
    return await this.postsService.deletePost(id, user || null);
  }

  @Post(':id/likes')
  @ApiOperation({
    summary: '좋아요 추가',
    description: '특정 게시물의 좋아요를 추가합니다.',
  })
  async addLikes(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.addLikes(id);
  }

  @Post(':id/view')
  @ApiOperation({
    summary: '조회수 추가',
    description: '특정 게시물의 조회수를 추가합니다.',
  })
  async addView(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.addView(id);
  }
}
