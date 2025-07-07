import { DataSource, DataSourceOptions } from 'typeorm';
import config from './config';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export const ormConfig: DataSourceOptions = {
  type: 'mongodb',
  url: config.mongodb.uri,
  entities: [UserAuthEntity, PasswordResetTokenEntity],
};

const dataSource = new DataSource(ormConfig);
export default dataSource;
