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

<<<<<<<< HEAD:apps/auth-service/entities/user-auth.entity.ts
@Entity('user-auth')
========
import { RegistrationMethod } from '../enums/registration-method';

@Entity('user-auth-entity')
>>>>>>>> 55140b987ae2e708d424a093247a94c0e97d960c:apps/auth-service/entities/user-auth-entity.ts
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

<<<<<<<< HEAD:apps/auth-service/entities/user-auth.entity.ts
  @Column({ type: 'string', default: RegistrationMethodEnum.EMAIL })
  registrationMethod!: RegistrationMethodEnum;
========
  @Column({ type: 'string' })
  registrationMethod!: RegistrationMethod;
>>>>>>>> 55140b987ae2e708d424a093247a94c0e97d960c:apps/auth-service/entities/user-auth-entity.ts

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  databaseUpdatedAt!: Date;

  @Column()
  expiresAt!: Date;
}
