import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IsOwner } from 'src/auth/decorators/is-owner.decorator';
import { IsOwnerGuard } from 'src/auth/guards/is-owner.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * @COMMENTS
   */
  @Get('post/:id')
  async findAllGroups(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.findCommentsInPostDetail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/:id')
  async createOneComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateCommentDto,
  ) {
    return await this.commentsService.createOneComment(id, { content });
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('comment')
  @Post(':id')
  async updateOneComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateCommentDto,
  ) {
    return await this.commentsService.updateOneComment(id, { content });
  }

  @UseGuards(JwtAuthGuard)
  @IsOwner('comment')
  @Post(':id')
  async deleteOneComment(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.deleteOneComment(id);
  }
}
