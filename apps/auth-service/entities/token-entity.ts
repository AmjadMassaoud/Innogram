import {
  ObjectIdColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectId,
} from 'typeorm';

@Entity('tokens')
export class TokenEntity {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column({ type: 'string' })
  username!: string;

  @Column({ type: 'string', unique: true })
  userEmail!: string;

  @Column({ type: 'string' })
  userPassword!: string;

  @Column({ type: 'string' })
  refreshToken!: string;

  @Column({ type: 'string' })
  type!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  databaseUpdatedAt!: Date;

  @Column()
  expiresAt!: Date;
}
