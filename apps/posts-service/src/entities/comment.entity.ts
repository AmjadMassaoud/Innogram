import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { UserEntity } from '@app/entities-lib';
@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Index()
  @Column({ type: 'int', name: 'post_id' })
  postId!: number;

  @Index()
  @Column({ type: 'uuid', name: 'comment_creator_user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'comment_creator_user_id' })
  commentAuthor!: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments)
  @JoinColumn({ name: ' post_id' })
  post!: PostEntity;

  @CreateDateColumn({
    type: 'time with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
