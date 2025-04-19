import {
  BadRequestException,
  Body,
  Controller,
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
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Posts') // Swagger UI에서 그룹 이름
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('test')
  @ApiOperation({ summary: '테스트용', description: '테스트용 API입니다.' })
  @ApiExcludeEndpoint() // 스웨거에 제외
  findAll() {
    return [{ id: 1, title: '테스트' }];
  }

  @Get()
  @ApiOperation({
    summary: '모든 게시글 조회',
    description: 'DB에 있는 모든 게시글 목록을 반환합니다.',
  })
  async findAllPosts(
    @Query('groupId') groupId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagIds') tagIds?: string[],
  ) {
    const parsedGroupId = groupId !== undefined ? +groupId : undefined;
    const parsedCategoryId = categoryId !== undefined ? +categoryId : undefined;

    if (groupId && isNaN(parsedGroupId)) {
      throw new BadRequestException('groupId must be a number');
    }
    if (categoryId && isNaN(parsedCategoryId)) {
      throw new BadRequestException('categoryId must be a number');
    }

    // tagsId같은 경우 연달아 여러 개 쓰면 배열로 처리됨.
    const validatedTags = Array.isArray(tagIds)
      ? tagIds
      : [tagIds].filter(Boolean);
    const parsedTagIds = validatedTags.map((id) => parseInt(id, 10));
    return await this.postsService.findAllPosts({
      groupId: parsedGroupId,
      categoryId: parsedCategoryId,
      tagIds: parsedTagIds,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  @Post()
  @ApiOperation({
    summary: '게시글 생성',
    description: 'DB에 게시글을 저장합니다.',
  })
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(createPostDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글을 상세 조회합니다.',
  })
  async findPostDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findPostDetail(id);
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
  ) {
    return await this.postsService.updatePost(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('post')
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: '게시글 삭제',
    description: '특정 게시글을 삭제합니다.',
  })
  async removeOnePost(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.deletePost(id);
  }
}
