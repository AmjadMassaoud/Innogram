import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserLoginDTO,
  UserRegistrationDTO,
} from '../../services-dtos/auth-dto/auth.dto';
import {
  GoogleAuthResponse,
  LoginResponse,
  SignupResponse,
} from '../../services-interfaces/auth.interfaces';
import { AuthHttpProvider } from '../../servicers-providers/auth-service/auth.http.provider';
import { VerifyAccessTokenGuard } from '../../utils/guards/verify-access-token.guard';
import { PublicRoute } from '../../utils/custom-decorators/public-route.decorator';
import type { Request, Response } from 'express';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('api-gateway/auth')
export class AuthGatewayController {
  constructor(private readonly authHttpProvider: AuthHttpProvider) {}

  @PublicRoute()
  @Post('register')
  @UseGuards(VerifyAccessTokenGuard)
  @ApiCreatedResponse({
    description: 'Returns a signup response if successful',
  })
  async registerUser(
    @Body() userCredentials: UserRegistrationDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignupResponse> {
    try {
      const { accessToken, user, refreshToken } =
        await this.authHttpProvider.registerUser(userCredentials);

      if (refreshToken) {
        res.cookie('jid', refreshToken, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: true,
        });
      }

      return { accessToken, user };
    } catch (error) {
      throw error;
    }
  }

  @PublicRoute()
  @Post('login')
  @ApiCreatedResponse({
    description: 'Returns a login response if successful',
  })
  async loginUser(
    @Body() userCredentials: UserLoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, setCookieHeader, user } =
      await this.authHttpProvider.loginUser(userCredentials);

    if (setCookieHeader) {
      res.setHeader('set-cookie', setCookieHeader);
    }

    return { accessToken, user };
  }

  @Post('logout')
  @ApiCreatedResponse({
    description: 'Logs user out if successful with cookie removal',
  })
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const cookieJID = req.cookies['jid'];

    if (!cookieJID) {
      throw new UnauthorizedException('JID is not provided');
    }

    try {
      const { message } = await this.authHttpProvider.logoutUser(cookieJID);

      if (message) {
        res.clearCookie('jid', {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
        });
      }

      return { message };
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh-token')
  @ApiCreatedResponse({
    description: 'Returns a new access token if successful',
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const cookieJID = req.cookies['jid'];

    if (!cookieJID) {
      throw new UnauthorizedException('JID is not provided');
    }
    try {
      const { accessToken } =
        await this.authHttpProvider.refreshUserToken(cookieJID);

      if (accessToken) {
        res.cookie('jid', accessToken, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: true,
        });
      }

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  @PublicRoute()
  @Post('google-callback')
  @ApiCreatedResponse({
    description: 'Returns a login response if successful',
  })
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<GoogleAuthResponse> {
    const code = req.query.code as string;

    try {
      const data = await this.authHttpProvider.googleCallback(code);

      if (data) {
        res.setHeader('set-cookie', data.accessToken!);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}
