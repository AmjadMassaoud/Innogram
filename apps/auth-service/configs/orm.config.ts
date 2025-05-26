import { DataSource, DataSourceOptions } from 'typeorm';
import config from './config';
import { TokenEntity } from '../entities/token-entity';

export const ormConfig: DataSourceOptions = {
  type: 'mongodb',
  url: config.mongodb.uri,
  entities: [TokenEntity],
};

const dataSource = new DataSource(ormConfig);
export default dataSource;
