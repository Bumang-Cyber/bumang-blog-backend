import {
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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAllPosts(
    @Query('groupId', ParseIntPipe) groupId: number,
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Query('tagIds') tagIds: string[],
  ) {
    const validatedTags = Array.isArray(tagIds) ? tagIds : [tagIds];
    const parsedTagIds = validatedTags.map((id) => parseInt(id, 10));
    return await this.postsService.findAllPosts({
      groupId,
      categoryId,
      tagIds: parsedTagIds,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesEnum.ADMIN, RolesEnum.USER)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(createPostDto);
  }

  @Get(':id')
  async findPostDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findPostDetail(id);
  }

  // TODO: 자기자신만 접근 가능하도록....
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(id, updatePostDto);
  }

  // 자기자신만 접근 가능하도록....
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async removeOnePost(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.deletePost(id);
  }
}
