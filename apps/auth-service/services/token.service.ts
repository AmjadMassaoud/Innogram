import jwt from 'jsonwebtoken';
import config from '../configs/config';
import { UserAuthEntity } from '../entities/user-auth.entity';
import dataSource from '../configs/orm.config';
import { AuthenticationError } from '../custom-errors/auth.errors';
import httpStatus from 'http-status';

const userAuthRepo = dataSource.getRepository(UserAuthEntity);

interface TokenPayload {
  userId: string;
  email: string;
}

export async function generateAccessToken(
  payload: TokenPayload,
): Promise<string> {
  return jwt.sign(payload, config.jwt.access_token.secret, {
    expiresIn: config.jwt.access_token.expire,
  });
}

export async function generateRefreshToken(
  payload: TokenPayload,
): Promise<string> {
  const refreshToken = jwt.sign(payload, config.jwt.refresh_token.secret, {
    expiresIn: config.jwt.refresh_token.expire,
  });

  await userAuthRepo.update(
    {
      email: payload.email,
    },
    {
      refreshToken: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    },
  );

  return refreshToken;
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  return jwt.verify(token, config.jwt.access_token.secret) as TokenPayload;
}

export async function verifyRefreshToken(
  refreshToken: string,
): Promise<TokenPayload> {
  const payload = jwt.verify(
    refreshToken,
    config.jwt.refresh_token.secret,
  ) as TokenPayload;

  const storedToken = await userAuthRepo.findOne({
    where: { refreshToken, email: payload.email },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  return payload;
}

export async function invalidateRefreshToken(
  refreshToken: string,
): Promise<void> {
  try {
    await userAuthRepo.update(
      { refreshToken: refreshToken },
      { refreshToken: null },
    );
  } catch {
    throw new AuthenticationError(
      'Could not invalidate refreshToken',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
