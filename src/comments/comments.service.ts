import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostEntity } from 'src/posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
  ) {}

  // 1. 해당 포스트에 맞는 코멘트들을 찾기
  async findCommentsInPostDetail(postId: number) {
    const comments = await this.commentRepo.find({
      where: { post: { id: postId } },
      relations: ['post'],
      order: { id: 'ASC' },
    });

    return comments;
  }

  // 2. 댓글 생성하기
  async createOneComment(postId: number, dto: CreateCommentDto) {
    const { content } = dto;

    const post = await this.postRepo.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} does not exist.`);
    }

    if (!content || content.trim() === '') {
      throw new BadRequestException('Content cannot be an Empty string.');
    }

    const comment = this.commentRepo.create({
      content: content.trim(),
      // author,
      post,
    });
    return await this.commentRepo.save(comment);
  }

  // 3. 특정 댓글 수정하기
  async updateOneComment(id: number, dto: UpdateCommentDto) {
    const { content } = dto;
    const comment = await this.commentRepo.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} does not exist.`);
    }

    if (comment.content === content) {
      return comment;
    }

    comment.content = content;
    return await this.commentRepo.save(comment);
  }

  // 4. 특정 댓글 삭제하기
  async deleteOneComment(id: number) {
    const comment = await this.commentRepo.findOne({
      where: { id },
    });

    // 권한 체크
    // if ()

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} does not exist.`);
    }

    return await this.commentRepo.remove(comment);
  }
}
