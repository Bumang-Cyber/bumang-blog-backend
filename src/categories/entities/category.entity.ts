import { PostEntity } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { GroupEntity } from './group.entity';

@Unique(['group', 'order'])
@Entity()
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  label: string;

  @Column({
    nullable: false,
  })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GroupEntity, (group) => group.categories)
  @JoinColumn()
  group: GroupEntity;

  @ManyToMany(() => PostEntity, (post) => post.categories, {
    nullable: true,
    onDelete: 'SET NULL', // 카테고리 삭제 시 연결된 Post를 null로.
  })
  @JoinTable()
  posts: PostEntity[];
}
