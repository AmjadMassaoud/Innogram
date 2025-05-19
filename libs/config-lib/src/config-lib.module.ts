import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import appConfig from './configurations/app.config';
import databaseConfig from './configurations/database.config';
import { validationSchema } from './validation.schema';

import * as path from 'path';
const getEnvFilePath = () => {
  const serviceName = process.env.npm_lifecycle_event?.split(':').pop() || '';
  const envPath = path.join(process.cwd(), 'apps', serviceName);

  console.log('Service name:', serviceName);
  console.log('Env path:', envPath);

  return [
    path.join(envPath, `.env.${process.env.NODE_ENV}`),
    path.join(envPath, '.env'),
  ];
};

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
      load: [appConfig, databaseConfig],
      validationSchema: validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigLibModule {}
