import { CategoryEntity } from 'src/categories/entities/category.entity';
import { CommentEntity } from 'src/comments/entities/comment.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ type: 'json' })
  content: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  author: UserEntity;

  @ManyToMany(() => CategoryEntity, (category) => category.posts)
  categories: CategoryEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
