import { Body, Controller, Patch, Post } from '@nestjs/common';
import { PublicRoute } from '../../../common/decorators/public-route.decorator';
import { AuthHttpProvider } from '../providers/auth.http.provider';
import { RequestPasswordResetDto, ResetPasswordDto } from '../dtos/auth.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { RequestPasswordResetResponse } from '../interfaces/auth.interfaces';

@Controller('api-gateway/v1/passwords')
export class AuthPasswordGatewayController {
  constructor(private readonly authHttpProvider: AuthHttpProvider) {}

  @PublicRoute()
  @Post()
  @ApiCreatedResponse({
    description:
      'Requests Auth-service to send a password reset token to be used with Email-service',
    type: RequestPasswordResetDto,
  })
  async requestPasswordReset(@Body() email: RequestPasswordResetResponse) {
    return this.authHttpProvider.requestPasswordReset(email);
  }

  @PublicRoute()
  @Patch()
  @ApiCreatedResponse({
    description: 'Returns a successful message.',
  })
  async resetUserPassword(
    @Body() userCredentials: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authHttpProvider.resetUserPassword(userCredentials);
  }
}
