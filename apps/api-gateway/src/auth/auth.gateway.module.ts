import { Module } from '@nestjs/common';
import { HttpModule, HttpModuleOptions } from '@nestjs/axios';
import { AuthGatewayController } from './controllers/auth.gateway.controller';
import { ConfigService } from '@nestjs/config';
import { AuthHttpProvider } from './providers/auth.http.provider';
import { ConfigLibModule } from '@app/config-lib';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthPasswordGatewayController } from './controllers/auth-password.gateway.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigLibModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<HttpModuleOptions> => ({
        timeout: 5000,
        maxRedirects: 3,
        baseURL: configService.get<string>('AUTH_SERVICE_BASE_URL'),
        headers: {
          'x-internal-api-secret': configService.get<string>(
            'INTERNAL_API_SECRET',
          ),
          'Content-Type': 'application/json',
        },
      }),
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
