import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAllPosts(
    @Query('groupId', ParseIntPipe) groupId: number,
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Query('tagId', ParseIntPipe) tagId: number,
  ) {
    return await this.postsService.findAllPosts({ groupId, categoryId, tagId });
  }

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(createPostDto);
  }

  @Get(':id')
  async findPostDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.postsService.findPostDetail(id);
  }
}
