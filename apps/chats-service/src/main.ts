import { NestFactory } from '@nestjs/core';
import { ChatsServiceModule } from './chats-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatsServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
