import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // 타입orm 세팅. postgres서버 만들 때 입력했던대로 제공
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      // nest.js의 typeorm 코드와 실제 db환경을 연동할 것인가?
      // 개발환경에선 false
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
