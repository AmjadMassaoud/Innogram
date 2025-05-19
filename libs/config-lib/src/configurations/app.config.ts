import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT!) || 3002,
  microservicePort: parseInt(process.env.MICROSERVICE_PORT!) || 3003,
}));
