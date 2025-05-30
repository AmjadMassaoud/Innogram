import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostEntity } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom, timeout } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { USERS_MICROSERVICE_CLIENT } from '../../api-gateway/microservices-client-constants/microservices-client-contants';
import { CommentEntity } from './entities/comment.entity';

@Injectable()
export class PostsServiceService {
  private readonly logger = new Logger(PostsServiceService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postsRepo: Repository<PostEntity>,

    @InjectRepository(CommentEntity)
    private readonly commentsRepo: Repository<CommentEntity>,

    @Inject(USERS_MICROSERVICE_CLIENT)
    private readonly userServiceClient: ClientProxy,
  ) {}

  async likePost(id: number) {
    this.logger.log(`Liking post with id: ${id}`);

    await this.postsRepo.increment({ id }, 'likesCount', 1);

    return { message: 'Post liked successfully', id };
  }

  async commentOnPost(
    userId: string,
    content: string,
    postId: number,
  ): Promise<string> {
    const userValidationPattern = { cmd: 'validate_user' };
    const userIdPayload = { userId };

    let userValidationRes;
    try {
      userValidationRes = await firstValueFrom(
        this.userServiceClient
          .send<{
            exists: boolean;
            id: string;
          }>(userValidationPattern, userIdPayload)
          .pipe(timeout(5000)),
      );
    } catch (err: unknown) {
      if (err instanceof RpcException) {
        throw err; // Re-throw RpcException as is
      }

      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new RpcException(
          `Request to user service timed out for user ${userId}`,
        );
      }

      // For other generic errors from the client proxy or other issues
      throw new RpcException(
        `Failed to verify user ${userId} with user service. Details: ${err}`,
      );
    }

    // save post in the db
    const comment = this.commentsRepo.create({
      content,
      userId,
      postId,
    });

    try {
      await this.commentsRepo.save(comment);
    } catch (err) {
      throw new RpcException(`Comment isn't saved in Database: ${err}`);
    }

    return 'hello';
  }
}
