import { PostCommentDto } from './DTOs/create-comment.dto';
import { Controller, Get } from '@nestjs/common';
import { PostsServiceService } from './posts-service.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PostsServiceController {
  constructor(private readonly postsServiceService: PostsServiceService) {}

  @MessagePattern({ cmd: 'like_post' })
  async likePost(data: { id: string }) {
    console.log('Posts Service: Received like_post request:', data);
    // return this.postsServiceService.likePost(data.id);
  }

  // @MessagePattern({ cmd: 'comment_post' })
  // async commentOnPost(data: PostCommentDto): Promise<string> {
  //   // return this.postsServiceService.commentOnPost(data.userId, data.content);
  // }
}
