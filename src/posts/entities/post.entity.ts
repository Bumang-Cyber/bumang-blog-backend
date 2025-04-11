import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { TagsEntity } from 'src/tags/entities/tag.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('jsonb')
  content: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  author: UserEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.posts, {
    onDelete: 'SET NULL', // ✅ 이쪽에 넣어야 DB에서 제대로 동작
    nullable: true,
  })
  @JoinColumn()
  category: CategoryEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @ManyToMany(() => TagsEntity, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags: TagsEntity[];
}
