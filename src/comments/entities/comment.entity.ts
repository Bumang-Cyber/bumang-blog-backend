import { PostEntity } from 'src/posts/entities/post.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.comments, { nullable: false })
  author: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments, { nullable: false })
  post: PostEntity;
}
