import { registerAs } from '@nestjs/config';

export default registerAs('databaseConfig', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT!) || 3000,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  name: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: process.env.DATABASE_AUTOLOADENTITIES,
}));
