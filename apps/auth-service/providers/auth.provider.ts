import type { Request, Response } from 'express';
import jwt, {
  type JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import httpStatus from 'http-status';
import * as bcrypt from 'bcrypt';
import dataSource from '../configs/orm.config';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
} from '../utils/token.util';
import {
  signupSchema,
  loginSchema,
} from '../schema-validations/auth.validation';
import { TokenEntity } from '../entities/token-entity';
import config from '../configs/config';

const TokenRepository = dataSource.getRepository(TokenEntity);

export async function handleSignUp(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: error.details[0].message,
      });
      return;
    }

    const { email, password, username } = value;

    // Check if user already exists
    const existingUser = await TokenRepository.findOne({
      where: { userEmail: email },
    });

    if (existingUser) {
      res.status(httpStatus.CONFLICT).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await TokenRepository.save({
      userEmail: email,
      userPassword: hashedPassword,
      username,
    });

    const tokenPayload = {
      userId: user.id.toHexString(),
      email: user.userEmail,
    };
    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // Set refresh token in HTTP-only cookie
    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.status(httpStatus.CREATED).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id.toHexString(),
        email: user.userEmail,
        username: user.username,
      },
    });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: error.details[0].message,
      });
      return;
    }

    const { email, password } = value;

    // Find user
    const user = await TokenRepository.findOne({
      where: { userEmail: email },
    });

    if (!user) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.userPassword);
    if (!validPassword) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Invalid credentials' });
      return;
    }

    const tokenPayload = {
      userId: user.id.toHexString(),
      email: user.userEmail,
    };
    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    // update user's refreshToken
    await TokenRepository.update(
      { userEmail: email },
      {
        refreshToken: refreshToken,
      },
    );

    // Set refresh token in HTTP-only cookie
    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.json({
      accessToken,
      user: {
        id: user.id.toHexString(),
        email: user.userEmail,
        username: user.username,
      },
    });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error!!' });
  }
}

export async function handleRefreshToken(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.cookies.jid;
    if (!token) {
      res.status(httpStatus.UNAUTHORIZED).json({ error: 'No refresh token' });
      return;
    }

    const payload = await verifyRefreshToken(token);

    const user = await TokenRepository.findOne({
      where: { userEmail: payload.email },
    });

    if (!user) {
      res.status(httpStatus.UNAUTHORIZED).json({ error: 'User not found' });
      return;
    }

    const tokenPayload = {
      userId: user.id.toHexString(),
      email: user.userEmail,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    await invalidateRefreshToken(token);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.json({ accessToken });
  } catch (error) {
    res
      .status(httpStatus.UNAUTHORIZED)
      .json({ error: 'Invalid refresh token' });
  }
}

export async function handleVerifyAccessToken(req: Request, res: Response) {
  const token = req.body.accessToken;

  if (!token) {
    return res.status(httpStatus.BAD_REQUEST).json({
      isValid: false,
      message: 'Access token is required.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwt.access_token.secret,
    ) as JwtPayload;

    // Token is valid, send back the decoded payload (or just a success status)
    // The payload typically contains userId, email, roles, etc.
    return res.status(httpStatus.OK).json({
      isValid: true,
      message: 'Access token is valid.',
      user: decoded, // Send the decoded payload which contains user info
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        isValid: false,
        message: 'Access token has expired.',
        error: 'TokenExpiredError',
      });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        isValid: false,
        message: 'Access token is invalid.',
        error: 'JsonWebTokenError',
      });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      isValid: false,
      message: 'An error occurred during token verification.',
    });
  }
}

export async function handleLogout(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies.jid;
    if (token) {
      await invalidateRefreshToken(token);
    }

    res.clearCookie('jid', {
      path: '/innogram/auth',
    });

    res.status(httpStatus.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
}
