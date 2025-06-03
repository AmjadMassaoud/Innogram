import {
  ObjectIdColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectId,
} from 'typeorm';

import { RegistrationMethod } from '../enums/registration-method';

@Entity('user-auth-entity')
export class UserAuthEntity {
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

  @Column({ type: 'string', nullable: true })
  googleUserId!: string;

  @Column({ type: 'string' })
  registrationMethod!: RegistrationMethod;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  databaseUpdatedAt!: Date;

  @Column()
  expiresAt!: Date;
}
