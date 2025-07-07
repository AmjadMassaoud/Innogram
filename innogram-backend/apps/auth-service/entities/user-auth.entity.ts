import { Column, Entity, UpdateDateColumn } from 'typeorm';
import { TRefreshToken } from '../common/types/t-refresh.token';
import { ERegistrationMethod } from '../common/enums/registration-method.enum';
import { BaseEntity } from './entities-base.entity';

@Entity('user-auth')
export class UserAuthEntity extends BaseEntity {
  @Column({ type: 'string' })
  username!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'string' })
  password!: string;

  @Column({ type: 'string', nullable: true })
  refreshToken!: TRefreshToken;

  @Column({ type: 'string' })
  type!: string;

  @Column({ type: 'string', nullable: true })
  googleUserId!: string;

  @Column({ type: 'string', nullable: true })
  googleRefreshToken?: string;

  @Column({ type: 'string', default: ERegistrationMethod.EMAIL })
  registrationMethod!: ERegistrationMethod;

  @UpdateDateColumn()
  databaseUpdatedAt!: Date;
}
