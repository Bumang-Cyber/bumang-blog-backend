import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RolesGuard } from './guards/roles.guard';

import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsModule } from 'src/comments/comments.module';
import { IsOwnerGuard } from './guards/is-owner.guard';

@Module({
  imports: [
    // UsersModule,
    forwardRef(() => UsersModule), // 순환참조 방지 지연 로딩
    forwardRef(() => PostsModule), // 순환참조 방지 지연 로딩
    forwardRef(() => CommentsModule), // 순환참조 방지 지연 로딩
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    // 커스텀
    RolesGuard,
    IsOwnerGuard,
  ],
  exports: [JwtStrategy, RolesGuard, IsOwnerGuard],
})
export class AuthModule {}
