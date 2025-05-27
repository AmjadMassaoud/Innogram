import jwt from 'jsonwebtoken';
import config from '../configs/config';
import { TokenEntity } from '../entities/token-entity';
import dataSource from '../configs/orm.config';

const tokenRepository = dataSource.getRepository(TokenEntity);

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

  // Store refresh token in database

  await tokenRepository.update(
    {
      userEmail: payload.email,
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

  const storedToken = await tokenRepository.findOne({
    where: { refreshToken, userEmail: payload.email },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  return payload;
}

export async function invalidateRefreshToken(
  refreshToken: string,
): Promise<void> {
  await tokenRepository.delete({ refreshToken });
}
