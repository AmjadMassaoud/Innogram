import { Module } from '@nestjs/common';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { AuthGatewayController } from '../services-controllers/auth-service/auth.gateway.controller';
import { ConfigService } from '@nestjs/config';
import { AuthHttpProvider } from '../servicers-providers/auth-service/auth.http.provider';
import { ConfigLibModule } from '@app/config-lib';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthPasswordGatewayController } from '../services-controllers/auth-service/auth-password.gateway.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigLibModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<HttpModuleOptions> => {
        const internalApiSecret = configService.get<string>(
          'INTERNAL_API_SECRET',
        );
        if (!internalApiSecret) {
          throw new Error(
            'INTERNAL_API_SECRET is not defined in environment variables',
          );
        }
        return {
          timeout: 5000,
          maxRedirects: 3,
          baseURL: configService.get<string>('AUTH_SERVICE_BASEURL'),
          headers: {
            'x-internal-api-secret': internalApiSecret,
            'Content-Type': 'application/json',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthGatewayController, AuthPasswordGatewayController],
  providers: [
    AuthHttpProvider,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthGatewayModule {}
