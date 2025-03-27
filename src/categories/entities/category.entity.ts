import { PostEntity } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column()
  label: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => PostEntity, (post) => post.categories)
  @JoinTable()
  posts: PostEntity[];
}
