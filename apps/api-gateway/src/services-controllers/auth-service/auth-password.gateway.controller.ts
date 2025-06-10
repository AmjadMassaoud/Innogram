import { Body, Controller, Post } from '@nestjs/common';
import { PublicRoute } from '../../utils/custom-decorators/public-route.decorator';
import { AuthHttpProvider } from '../../servicers-providers/auth-service/auth.http.provider';
import {
  RequestPasswordResetDTO,
  ResetPasswordDTO,
} from '../../services-dtos/auth-dto/auth.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { RequestPasswordResetResponse } from '../../services-interfaces/auth.interfaces';

@Controller('api-gateway/password')
export class AuthPasswordGatewayController {
  constructor(private readonly authHttpProvider: AuthHttpProvider) {}

  @PublicRoute()
  @Post('request-password-reset')
  @ApiCreatedResponse({
    description:
      'Requests Auth-service to send a password reset token to be used with Email-service',
    type: RequestPasswordResetDTO,
  })
  async requestPasswordReset(@Body() email: RequestPasswordResetResponse) {
    return this.authHttpProvider.requestPasswordReset(email);
  }

  @PublicRoute()
  @Post('reset-password')
  @ApiCreatedResponse({
    description: 'Returns a successful message.',
  })
  async resetUserPassword(
    @Body() userCredentials: ResetPasswordDTO,
  ): Promise<{ message: string }> {
    return this.authHttpProvider.resetUserPassword(userCredentials);
  }
}
