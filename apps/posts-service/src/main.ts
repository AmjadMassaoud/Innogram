import { NestFactory } from '@nestjs/core';
import { PostsServiceModule } from './posts-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PostsServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(process.env.MICROSERVICE_PORT!) ?? 3011,
      },
    },
  );

  console.log('running');
  await app.listen();
}
bootstrap();
