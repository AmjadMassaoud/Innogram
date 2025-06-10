import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Api-Gateway')
    .setDescription(
      'The API-Gateway is responsible for connecting to the different microservices and handling requests from the client ',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-gateway/api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3002);
}

bootstrap();
