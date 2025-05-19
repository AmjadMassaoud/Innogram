import { Module } from '@nestjs/common';
import { PostsServiceController } from './posts-service.controller';
import { PostsServiceService } from './posts-service.service';

@Module({
  imports: [],
  controllers: [PostsServiceController],
  providers: [PostsServiceService],
})
export class PostsServiceModule {}
