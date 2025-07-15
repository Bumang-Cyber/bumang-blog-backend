import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [PostsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
