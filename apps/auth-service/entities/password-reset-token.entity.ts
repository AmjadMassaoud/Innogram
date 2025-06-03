import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('password-reset-tokens')
export class PasswordResetTokenEntity {
  @ObjectIdColumn()
  id!: string;

  @Index()
  @Column({ unique: true })
  userEmail!: string;

  @Column({ unique: true })
  hashedToken!: string;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
