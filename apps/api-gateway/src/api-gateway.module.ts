import { Module } from '@nestjs/common';
import { AuthGatewayModule } from './services-modules/auth.gateway.module';
import { ConfigLibModule } from '@app/config-lib';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigLibModule,
    AuthGatewayModule,
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 10 }] }),
  ],
})
export class ApiGatewayModule {}
