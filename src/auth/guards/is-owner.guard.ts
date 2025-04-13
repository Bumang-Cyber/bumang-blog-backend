// src/auth/guards/is-owner.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_OWNER_KEY } from '../decorators/is-owner.decorator';
import { PostsService } from 'src/posts/posts.service';
import { CommentsService } from 'src/comments/comments.service';
// import { UsersModule } from 'src/users/users.module';
import { RolesEnum } from 'src/users/const/roles.const';

// 1. 포스트 모듈 (v)
// 2. 카테고리 모듈
// 3. 코멘트 모듈 (v)
// 4. 태그 모듈
// 5. 유저 모듈 (v)

@Injectable()
export class IsOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly postsService: PostsService,
    // private readonly usersService: UsersModule,
    private readonly commentsService: CommentsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = this.reflector.getAllAndOverride<'post' | 'comment' | 'user'>(
      IS_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!type) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JwtStrategy에서 넣어준 값

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const resourceId = +request.params.id; // :id 파라미터
    if (!resourceId || !user?.userId) {
      throw new ForbiddenException('You do not have permission.');
    }

    const isOwner = await this.checkOwnership(resourceId, user.userId, type);

    if (!isOwner) {
      throw new ForbiddenException('Only the owner can modify or delete this.');
    }

    return true;
  }

  // ✅ 이 부분은 DI로 repository 또는 service 받아서 로직 구현 가능
  async checkOwnership(
    resourceId: number,
    userId: number,
    type: string,
  ): Promise<boolean> {
    switch (type) {
      case 'post': {
        const post = await this.postsService.findPostDetail(resourceId);
        return post?.author?.id === userId;
      }
      case 'comment': {
        const comment = await this.commentsService.findOneComment(resourceId);
        return comment?.author?.id === userId;
      }
      case 'user': {
        return resourceId === userId;
      }
      default:
        return false;
    }
  }
}
