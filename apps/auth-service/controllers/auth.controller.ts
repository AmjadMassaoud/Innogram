import { Router } from 'express';
import {
  handleLogin,
  handleSignUp,
  handleLogout,
  handleRefreshToken,
} from '../providers/auth.provider';
import { refreshTokenCookieConfig } from '../configs/cookie.config';

import {
  handleGoogleAuthCallback,
  initGoogle,
} from '../providers/google.auth.provider';
import {
  loginSchema,
  signupSchema,
} from '../schema-validations/auth.validation';
import httpStatus from 'http-status';
import config from '../configs/config';
import type { Request, Response } from 'express';
import {
  AuthenticationError,
  NoTokenProvidedError,
} from '../custom-errors/auth.errors';

const authController = Router();

authController.post('/login', async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      error: error.details[0].message,
    });
    return;
  }

  try {
    const { refreshToken, accessToken, user } = await handleLogin(value);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.json({
      accessToken,
      user: {
        ...user,
      },
    });
  } catch {
    throw new AuthenticationError(
      'An internal server error occurred during signup.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
});

authController.post('/signup', async (req: Request, res: Response) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      error: error.details[0].message,
    });
    return;
  }

  try {
    const { accessToken, refreshToken, user } = await handleSignUp(value);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.json({
      accessToken,
      user: {
        ...user,
      },
    });
  } catch {
    throw new AuthenticationError(
      'An internal server error occurred during signup.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
});

authController.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies.jid;
  if (!token) {
    throw new NoTokenProvidedError();
  }

  try {
    await handleLogout(token);

    res.clearCookie('jid', {
      path: '/innogram/auth',
    });

    res.status(httpStatus.OK).json({ message: 'Logged out successfully' });
  } catch {
    throw new AuthenticationError(
      'An internal server error occurred during signup.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
});

authController.post('/refresh-token', async (req: Request, res: Response) => {
  const token = req.cookies.jid;
  if (!token) {
    throw new NoTokenProvidedError();
  }

  try {
    const { accessToken, refreshToken } = await handleRefreshToken(token);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/innogram/auth',
      sameSite: 'lax',
      secure: config.node_env === 'production',
    });

    res.json({ accessToken });
  } catch {
    throw new AuthenticationError(
      'An internal server error occurred during signup.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
});

authController.get('/google', initGoogle);
authController.post('/google-callback', async (req: Request, res: Response) => {
  const code: string = req.query.code as string;
  if (!code) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Authorization code missing.' });
    return;
  }

  try {
    const { newRefreshToken, message, accessToken, user } =
      await handleGoogleAuthCallback(code);

    if (newRefreshToken) {
      res.cookie('jid', newRefreshToken, {
        ...refreshTokenCookieConfig,
        path: '/',
      });
    }

    res.status(httpStatus.OK).json({
      message,
      accessToken,
      ...user,
    });
  } catch {
    throw new AuthenticationError(
      'An internal server error occurred during signup.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
});

export default authController;
