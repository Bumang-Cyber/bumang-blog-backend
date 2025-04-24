import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { GroupEntity } from './entities/group.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PostEntity } from 'src/posts/entities/post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, GroupEntity, PostEntity]),
    AuthModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
