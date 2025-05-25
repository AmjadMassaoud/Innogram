import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class PostCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID()
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNumber()
  @IsNotEmpty()
  postId!: number;
}
