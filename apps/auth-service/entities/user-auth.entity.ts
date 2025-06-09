import {
  ObjectIdColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectId,
} from 'typeorm';
import { RegistrationMethodEnum } from '../enums/registration-method.enum';
import { refreshTokenType } from '../types/refresh-token.type';

@Entity('user-auth')
export class UserAuthEntity {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column({ type: 'string' })
  username!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'string' })
  password!: string;

  @Column({ type: 'string', nullable: true })
  refreshToken!: refreshTokenType;

  @Column({ type: 'string' })
  type!: string;

  @Column({ type: 'string', nullable: true })
  googleUserId!: string;

  @Column({ type: 'string', default: RegistrationMethodEnum.EMAIL })
  registrationMethod!: RegistrationMethodEnum;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  databaseUpdatedAt!: Date;

  @Column()
  expiresAt!: Date;
}
