import { ConfigLibModule } from '@app/config-lib';
import { Module } from '@nestjs/common';
import { PostsServiceController } from './posts-service.controller';
import { PostsServiceService } from './posts-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { CommentEntity } from './entities/comment.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS_MICROSERVICE_CLIENT } from '../../api-gateway/microservices-client-constants/microservices-client-contants';
import { UserEntity } from '@app/entities-lib';

@Module({
  imports: [
    ConfigLibModule,
    TypeOrmModule.forFeature([PostEntity, CommentEntity]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigLibModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.get<string>('databaseConfig.name'),
        host: configService.get<string>('databaseConfig.host'),
        port: configService.get<number>('databaseConfig.port'),
        username: configService.get<string>('databaseConfig.username'),
        password: configService.get<string>('databaseConfig.password'),
        autoLoadEntities: configService.get<boolean>(
          'databaseConfig.autoLoadEntities',
        ),
        synchronize: configService.get<boolean>('databaseConfig.synchronize'),
        logging: configService.get<boolean>('databaseConfig.logging'),
        entities: [UserEntity],
      }),
    }),

    ClientsModule.register([
      {
        name: USERS_MICROSERVICE_CLIENT,
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: parseInt(process.env.USERS_MICROSERVICE_PORT!) ?? 3014,
        },
      },
    ]),
  ],
  controllers: [PostsServiceController],
  providers: [PostsServiceService],
})
export class PostsServiceModule {}
