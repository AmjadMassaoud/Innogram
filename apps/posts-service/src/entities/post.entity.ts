import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '@app/entities-lib';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_user_id' })
  authorId!: UserEntity;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  imageUrls?: string[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ type: 'int', default: 0, nullable: false })
  likesCount!: number;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments!: CommentEntity;
}
