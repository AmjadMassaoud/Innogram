import httpStatus from 'http-status';
import {
  OAuth2Client,
  TokenPayload as GoogleTokenPayload,
  LoginTicket,
} from 'google-auth-library';

import { UserAuthEntity } from '../entities/user-auth.entity';
import dataSource from '../configs/orm.config';

import { generateAccessToken, generateRefreshToken } from '../utils/token.util';

import config from '../configs/config';

import { Repository } from 'typeorm';
import { RegistrationMethodEnum } from '../enums/registration-method.enum';
import { GoogleAuthVerificationError } from '../custom-errors/google-auth.errors';
import { GoogleAuthReturnType } from '../interfaces/google-auth-interfaces/google-auth.interface';
import { AuthenticationError } from '../custom-errors/auth.errors';

const oAuth2Client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl,
);

// Handles the callback from Google after user authentication.
export const handleGoogleAuthCallback = async (
  code: string,
): Promise<GoogleAuthReturnType> => {
  try {
    // Exchange the authorization code for tokens from Google
    const { tokens } = await oAuth2Client.getToken(code);

    const ticket: LoginTicket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.google.clientId,
    });

    const googlePayload: GoogleTokenPayload | undefined = ticket.getPayload();

    if (!googlePayload || !googlePayload.email || !googlePayload.sub) {
      throw new GoogleAuthVerificationError(
        'Failed to verify Google user or retrieve necessary data',
      );
    }

    const userEmail: string = googlePayload.email;
    const googleUserId: string = googlePayload.sub; // Google's unique ID for the user
    const userName: string = googlePayload.name || userEmail.split('@')[0];

    const userAuthRepo: Repository<UserAuthEntity> =
      dataSource.getRepository(UserAuthEntity);

    let user = await userAuthRepo.findOne({
      where: { email: userEmail },
    });

    if (!user) {
      const passwordPlaceholder = `google_oauth_${googleUserId}`;

      let primaryUserRecord = userAuthRepo.create({
        email: userEmail,
        password: passwordPlaceholder,
        username: userName,
        registrationMethod: RegistrationMethodEnum.GOOGLE,
        googleUserId: googleUserId,
      });
      primaryUserRecord = await userAuthRepo.save(primaryUserRecord);

      user = await userAuthRepo.save(primaryUserRecord);
    }

    // Generating app's token
    const jwtPayloadForApp = {
      userId: user.id.toHexString(), // canonical user id
      email: user.email,
    };

    const accessToken = await generateAccessToken(jwtPayloadForApp);
    const newRefreshToken = await generateRefreshToken(jwtPayloadForApp);
    const refreshTokenExpiresInMs = parseInt(
      config.jwt.refresh_token.expire || (7 * 24 * 60 * 60 * 1000).toString(),
    );

    await userAuthRepo.update(
      { email: user.email, googleUserId: user.googleUserId },
      {
        googleUserId: user.googleUserId,
        email: user.email,
        username: user.username,
        password: user.password, // Carry over from USER_ACCOUNT
        refreshToken: newRefreshToken,
        registrationMethod: RegistrationMethodEnum.GOOGLE,
        expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
      },
    );

    return {
      newRefreshToken,
      message: 'Google authentication successful',
      accessToken,
      user: {
        id: user.googleUserId,
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    if (error instanceof GoogleAuthVerificationError) {
      throw new AuthenticationError(error.message, httpStatus.UNAUTHORIZED);
    }

    throw new GoogleAuthVerificationError('Google Auth failed');
  }
};
