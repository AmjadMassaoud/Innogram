import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './entities-base.entity';

@Entity('password-reset-tokens')
export class PasswordResetTokenEntity extends BaseEntity {
  @Index()
  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  hashedToken!: string;
}
