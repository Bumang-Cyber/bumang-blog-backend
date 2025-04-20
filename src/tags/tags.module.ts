import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsEntity } from './entities/tag.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GroupEntity } from 'src/categories/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagsEntity, GroupEntity]), AuthModule],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
