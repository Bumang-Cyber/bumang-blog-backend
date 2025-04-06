import { PostEntity } from 'src/posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  // set null은 post 엔티티 쪽에서.
  @OneToMany(() => PostEntity, (post) => post.category)
  posts: PostEntity[];
}
