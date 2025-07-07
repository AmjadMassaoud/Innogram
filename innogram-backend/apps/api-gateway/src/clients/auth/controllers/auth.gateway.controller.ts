import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
  Delete,
} from "@nestjs/common";
import { UserLoginDto, UserRegistrationDto } from "../dtos/auth.dto";
import {
  GoogleAuthResponse,
  LoginResponse,
  SignupResponse,
} from "../interfaces/auth.interfaces";
import { AuthHttpProvider } from "../providers/auth.http.provider";
import { VerifyAccessTokenGuard } from "../../../common/guards/verify-access-token.guard";
import { PublicRoute } from "../../../common/decorators/public-route.decorator";
import type { Request, Response } from "express";
import { ApiCreatedResponse } from "@nestjs/swagger";
import GoogleCodeDto from "../dtos/google-code.dto";

@Controller("api-gateway/v1/auth")
export class AuthGatewayController {
  constructor(private readonly authHttpProvider: AuthHttpProvider) {}

  @PublicRoute()
  @Post("users")
  @UseGuards(VerifyAccessTokenGuard)
  @ApiCreatedResponse({
    description: "Returns a signup response if successful",
  })
  async registerUser(
    @Body() userCredentials: UserRegistrationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SignupResponse> {
    try {
      const { accessToken, user, refreshToken } =
        await this.authHttpProvider.registerUser(userCredentials);

      if (refreshToken) {
        res.cookie("jid", refreshToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
      }

      return { accessToken, user };
    } catch (error) {
      throw error;
    }
  }

  @PublicRoute()
  @Post("tokens")
  @ApiCreatedResponse({
    description: "Returns a login response if successful",
  })
  async loginUser(
    @Body() userCredentials: UserLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, setCookieHeader, user } =
      await this.authHttpProvider.loginUser(userCredentials);

    if (setCookieHeader) {
      res.setHeader("set-cookie", setCookieHeader);
    }

    return { accessToken, user };
  }

  @Delete("tokens")
  @ApiCreatedResponse({
    description: "Logs user out if successful with cookie removal",
  })
  async logoutUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const cookieJID = req.cookies["jid"];

    if (!cookieJID) {
      throw new UnauthorizedException("JID is not provided");
    }

    try {
      const { message } = await this.authHttpProvider.logoutUser(cookieJID);

      if (message) {
        res.clearCookie("jid", {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: true,
        });
      }

      return { message };
    } catch (error) {
      throw error;
    }
  }

  @Post("tokens/refresh")
  @ApiCreatedResponse({
    description: "Returns a new access token if successful",
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const cookieJID = req.cookies["jid"];

    if (!cookieJID) {
      throw new UnauthorizedException("JID is not provided");
    }
    try {
      const { accessToken } =
        await this.authHttpProvider.refreshUserToken(cookieJID);

      if (accessToken) {
        res.cookie("jid", accessToken, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
      }

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  @PublicRoute()
  @Post("google")
  @ApiCreatedResponse({
    description: "Returns a login response if successful",
  })
  async googleCallback(
    @Body() code: GoogleCodeDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GoogleAuthResponse> {
    try {
      const data = await this.authHttpProvider.googleCallback(code);

      if (data) {
        res.cookie("jid", data.newRefreshToken!, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: true,
        });
      }

      const { newRefreshToken, ...rest } = data;

      return rest;
    } catch (error) {
      throw error;
    }
  }
}
