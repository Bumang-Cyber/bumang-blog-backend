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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comments') // Swagger UI에서 그룹 이름
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * @COMMENTS
   */
  @Get('post/:id')
  @ApiOperation({
    summary: '코멘트 조회',
    description: '특정 게시물에 달린 코멘트 조회합니다.',
  })
  async findAllGroups(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.findCommentsInPostDetail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/:id')
  @ApiOperation({
    summary: '코멘트 생성',
    description: '특정 게시물에 달린 코멘트를 생성합니다.',
  })
  async createOneComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateCommentDto,
  ) {
    return await this.commentsService.createOneComment(id, { content });
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('comment')
  @Post(':id')
  @ApiOperation({
    summary: '코멘트 수정',
    description: '특정 게시물에 달린 코멘트를 수정합니다.',
  })
  async updateOneComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() { content }: CreateCommentDto,
  ) {
    return await this.commentsService.updateOneComment(id, { content });
  }

  @UseGuards(JwtAuthGuard, IsOwnerGuard)
  @IsOwner('comment')
  @Post(':id')
  @ApiOperation({
    summary: '코멘트 삭제',
    description: '특정 게시물에 달린 코멘트를 삭제합니다.',
  })
  async deleteOneComment(@Param('id', ParseIntPipe) id: number) {
    return await this.commentsService.deleteOneComment(id);
  }
}
