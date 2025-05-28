import { Request, Response } from 'express';
import httpStatus from 'http-status';
import {
  OAuth2Client,
  TokenPayload as GoogleTokenPayload,
  LoginTicket,
} from 'google-auth-library';

import { TokenEntity } from '../entities/token-entity';
import dataSource from '../configs/orm.config';

import { generateAccessToken, generateRefreshToken } from '../utils/token.util';

import config from '../configs/config';

import { refreshTokenCookieConfig } from '../configs/cookie.config';
import { Repository } from 'typeorm';

const oAuth2Client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.callbackUrl,
);

// Handles the callback from Google after user authentication.
export const handleGoogleAuthCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const code: string = req.query.code as string;

  if (!code) {
    // Redirect to a frontend error page or send a JSON error
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Authorization code missing.' });
    return;
  }

  try {
    // Exchange the authorization code for tokens from Google
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.id_token) {
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to retrieve ID token from Google.' });
      return;
    }

    // Verify the ID token and get user profile information
    const ticket: LoginTicket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const googlePayload: GoogleTokenPayload | undefined = ticket.getPayload();

    if (!googlePayload || !googlePayload.email || !googlePayload.sub) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Failed to verify Google user.' });
      return;
    }

    const userEmail: string = googlePayload.email;
    const googleUserId: string = googlePayload.sub; // Google's unique ID for the user
    const userName: string = googlePayload.name || userEmail.split('@')[0];

    const tokenRepository: Repository<TokenEntity> =
      dataSource.getRepository(TokenEntity);

    let user = await tokenRepository.findOne({
      where: { userEmail: userEmail },
    });

    if (!user) {
      // User doesn't exist, create a new one
      // For Google sign-up, password is not set directly.
      // Store a placeholder or mark the account as OAuth-only.
      const passwordPlaceholder = `google_oauth_${googleUserId}`;

      let primaryUserRecord = tokenRepository.create({
        userEmail,
        userPassword: passwordPlaceholder, // This password won't be used for login
        username: userName,
        registrationMethod: 'google',
        googleUserId: googleUserId,
      });
      primaryUserRecord = await tokenRepository.save(primaryUserRecord);

      user = await tokenRepository.save(primaryUserRecord);
    }

    // Generating app's token
    const jwtPayloadForApp = {
      userId: user.id.toHexString(), // canonical user id
      email: user.userEmail,
    };

    const accessToken = await generateAccessToken(jwtPayloadForApp);
    const newRefreshTokenString = await generateRefreshToken(jwtPayloadForApp);
    const refreshTokenExpiresInMs = parseInt(
      config.jwt.refresh_token.expire || (7 * 24 * 60 * 60 * 1000).toString(),
    );

    // Create and save the NEW refresh token record for your app
    await tokenRepository.update(
      { userEmail: user.userEmail, googleUserId: user.googleUserId },
      {
        googleUserId: user.googleUserId,
        userEmail: user.userEmail,
        username: user.username,
        userPassword: user.userPassword, // Carry over from USER_ACCOUNT
        refreshToken: newRefreshTokenString,
        registrationMethod: 'google',
        expiresAt: new Date(Date.now() + refreshTokenExpiresInMs),
      },
    );

    res.cookie('jid', newRefreshTokenString, {
      ...refreshTokenCookieConfig,
      path: '/',
    });

    res.status(httpStatus.OK).json({
      message: 'Google authentication successful',
      accessToken,
      user: {
        id: user.googleUserId,
        email: user.userEmail,
        username: user.username,
      },
    });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Google authentication processing failed.' });
  }
};
