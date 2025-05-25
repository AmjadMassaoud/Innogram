import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import * as bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';

// --- TypeORM and Entity Imports ---
import dataSource from '../configs/ormconfig'; // Your TypeORM DataSource
import { TokenEntity } from '../entities/token-entity'; // Using your provided TokenEntity

// import {
//   createAccessToken,
//   createRefreshToken,
// } from '../utils/generateTokens.util';
// import config from '../config/config';
// import {
//   clearRefreshTokenCookieConfig,
//   refreshTokenCookieConfig,
// } from '../config/cookieConfig';

// import logger from '../middleware/logger';

const { verify } = jwt;

export const handleSignUp = async (req: Request, res: Response) => {
  // Note: 'username' from the request is used as the 'userEmail' for login
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Email and password are required!',
    });
  }

  const tokenRepository = dataSource.getRepository(TokenEntity);

  // Check if any record with this email already exists
  const existingUserRecord = await tokenRepository.findOne({
    where: { userEmail: email },
  });

  if (existingUserRecord) {
    return res
      .status(httpStatus.CONFLICT)
      .json({ message: 'Email already exists' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the initial user record in the 'tokens' collection.
    // The refresh token is irrelevant at this stage.
    const newUserRecord = tokenRepository.create({
      userEmail: email,
      userPassword: hashedPassword,
      refreshToken: 'initial_signup_placeholder', // This token is not usable
      isValid: false, // No valid session token on signup
      expiresAt: new Date(0), // Set expiry to the past
    });
    await tokenRepository.save(newUserRecord);

    // Note: The email verification flow from your previous code would go here.
    // For simplicity, it has been omitted but can be added back.

    res
      .status(httpStatus.CREATED)
      .json({ message: 'User registered successfully' });
  } catch (err) {
    logger.error('Signup Error:', err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'An error occurred during signup.' });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Email and password are required!' });
  }

  const tokenRepository = dataSource.getRepository(TokenEntity);

  try {
    // Find any record for the user to get their stored password for comparison
    const userRecord = await tokenRepository.findOne({
      where: { userEmail: email },
    });

    if (!userRecord) {
      // User does not exist
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userRecord.userPassword,
    );

    if (!isPasswordValid) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }

    // Invalidate all previous refresh tokens for this user
    await tokenRepository.update({ userEmail: email }, { isValid: false });

    // User is authenticated, now create new tokens
    const accessToken = createAccessToken(userRecord.id); // Using the ID from the found record as the user ID
    const newRefreshToken = createRefreshToken(userRecord.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create a new, valid token record for this login session
    const newToken = tokenRepository.create({
      userEmail: userRecord.userEmail,
      userPassword: userRecord.userPassword, // Password is saved again in the new record
      refreshToken: newRefreshToken,
      expiresAt,
      isValid: true,
    });
    await tokenRepository.save(newToken);

    res.cookie(
      config.jwt.refresh_token.cookie_name,
      newRefreshToken,
      refreshTokenCookieConfig,
    );

    return res.json({ accessToken });
  } catch (err) {
    logger.error('Login Error:', err);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'An error occurred during login.' });
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  const refreshToken = cookies?.[config.jwt.refresh_token.cookie_name];

  if (!refreshToken) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }

  res.clearCookie(
    config.jwt.refresh_token.cookie_name,
    clearRefreshTokenCookieConfig,
  );

  const tokenRepository = dataSource.getRepository(TokenEntity);
  // Invalidate the token instead of deleting it.
  await tokenRepository.update(
    { refreshToken: refreshToken },
    { isValid: false },
  );

  return res.sendStatus(httpStatus.NO_CONTENT);
};

export const handleRefresh = async (req: Request, res: Response) => {
  const refreshToken: string | undefined =
    req.cookies?.[config.jwt.refresh_token.cookie_name];

  if (!refreshToken) return res.sendStatus(httpStatus.UNAUTHORIZED);

  const tokenRepository = dataSource.getRepository(TokenEntity);
  const foundToken = await tokenRepository.findOne({
    where: { refreshToken: refreshToken },
  });

  // If token is not found or has already been invalidated, deny access.
  if (!foundToken || !foundToken.isValid) {
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: 'Invalid or expired refresh token.' });
  }

  // Invalidate the used refresh token to prevent reuse (Refresh Token Rotation)
  foundToken.isValid = false;
  await tokenRepository.save(foundToken);

  verify(
    refreshToken,
    config.jwt.refresh_token.secret,
    async (err: unknown, payload: JwtPayload) => {
      if (err) {
        return res
          .status(httpStatus.FORBIDDEN)
          .json({ message: 'Invalid refresh token signature.' });
      }

      // Token is valid, issue new tokens
      const accessToken = createAccessToken(payload.userId); // userId from the JWT payload
      const newRefreshToken = createRefreshToken(payload.userId);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create a new token record with the same user info but the new refresh token
      const tokenToSave = tokenRepository.create({
        userEmail: foundToken.userEmail,
        userPassword: foundToken.userPassword,
        refreshToken: newRefreshToken,
        expiresAt,
        isValid: true,
      });
      await tokenRepository.save(tokenToSave);

      res.cookie(
        config.jwt.refresh_token.cookie_name,
        newRefreshToken,
        refreshTokenCookieConfig,
      );

      return res.json({ accessToken });
    },
  );
};
