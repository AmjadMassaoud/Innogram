import httpStatus from "http-status";
import {
  OAuth2Client,
  TokenPayload as GoogleTokenPayload,
} from "google-auth-library";

import { UserAuthEntity } from "../entities/user-auth.entity";
import dataSource from "../configs/orm.config";

import { generateAccessToken, generateRefreshToken } from "./token.service";

import config from "../configs/config";

import { Repository } from "typeorm";
import { ERegistrationMethod } from "../common/enums/registration-method.enum";
import { GoogleAuthVerificationError } from "../custom-errors/google-auth.errors";
import { IGoogleAuthReturnType } from "../common/interfaces/google-auth-interfaces/google-auth.interface";
import { AuthenticationError } from "../custom-errors/auth.errors";

const oAuth2Client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  "postmessage",
);

export const handleGoogleAuthCallback = async (
  code: string,
): Promise<IGoogleAuthReturnType> => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);

    const googleRefreshToken = tokens.refresh_token;

    if (!tokens.id_token) {
      throw new GoogleAuthVerificationError(
        "Google did not return an ID token.",
      );
    }

    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const googlePayload: GoogleTokenPayload | undefined = ticket.getPayload();

    if (!googlePayload || !googlePayload.email || !googlePayload.sub) {
      throw new GoogleAuthVerificationError(
        "Failed to verify Google user or retrieve necessary data",
      );
    }

    const userEmail: string = googlePayload.email;
    const googleUserId: string = googlePayload.sub;
    const userName: string = googlePayload.name || userEmail.split("@")[0];

    const userAuthRepo: Repository<UserAuthEntity> =
      dataSource.getRepository(UserAuthEntity);

    let user = await userAuthRepo.findOneBy({ email: userEmail });

    if (!user) {
      user = userAuthRepo.create({
        email: userEmail,
        password: `google_oauth_${googleUserId}`,
        username: userName,
        registrationMethod: ERegistrationMethod.GOOGLE,
        googleUserId: googleUserId,
      });
    }

    if (googleRefreshToken) {
      user.googleRefreshToken = googleRefreshToken;
    }

    const jwtPayloadForApp = {
      userId: user.id.toString(),
      email: user.email,
    };

    const accessToken = await generateAccessToken(jwtPayloadForApp);
    const newRefreshToken = await generateRefreshToken(jwtPayloadForApp);

    user.refreshToken = newRefreshToken;

    await userAuthRepo.save(user);

    return {
      message: "Google authentication successful",
      newRefreshToken,
      accessToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    if (error instanceof GoogleAuthVerificationError) {
      throw new AuthenticationError(error.message, httpStatus.UNAUTHORIZED);
    }

    throw new GoogleAuthVerificationError("Google Auth failed");
  }
};
