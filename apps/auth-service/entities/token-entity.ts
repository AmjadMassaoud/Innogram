import {
  ObjectIdColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tokens')
export class TokenEntity {
  @ObjectIdColumn()
  id!: string;

  @Column()
  userEmail!: string;

  @Column()
  userPassword!: string;

  @Column()
  refreshToken!: string;

  @Column({ default: true })
  isValid!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  expiresAt!: Date;
}
