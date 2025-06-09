import { Router } from 'express';
import {
  handleLogin,
  handleSignUp,
  handleLogout,
  handleRefreshToken,
} from '../providers/auth.provider';
import { refreshTokenCookieConfig } from '../configs/cookie.config';

import { handleGoogleAuthCallback } from '../providers/google.auth.provider';
import {
  loginSchema,
  signupSchema,
} from '../schema-validations/auth.validation';
import httpStatus from 'http-status';
import config from '../configs/config';
import type { Request, Response } from 'express';
import { NoTokenProvidedError } from '../custom-errors/token.errors';

const authController = Router();

/**
 * @openapi
 * /innogram/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logs in a user
 *     parameters:
 *       - in: header
 *         name: x-internal-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API secret for request validation. Ensure this matches the 'INTERNAL_API_SECRET' environment variable.
 *         example: your_internal_api_secret
 *     description: Authenticates a user with their email and password, returning an access token and user information. Sets a refresh token in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jid=yourRefreshToken; Path=/innogram/auth; HttpOnly; SameSite=Lax
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8a5f4c8b4567"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     username:
 *                       type: string
 *                       example: "user123"
 *       400:
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "email is required"
 *       401:
 *         description: Unauthorized - Invalid credentials or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid password" # or "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An internal server error occurred during login."
 */
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
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /innogram/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Registers a new user
 *     description: Creates a new user account with email, password, and username. Returns an access token, user information, and sets a refresh token in an HTTP-only cookie.
 *     parameters:
 *       - in: header
 *         name: x-internal-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API secret for request validation.
 *         example: your_internal_api_secret
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: newSecurePassword123
 *               username:
 *                 type: string
 *                 example: newuser123
 *     responses:
 *       200:
 *         description: Signup successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jid=yourRefreshToken; Path=/innogram/auth; HttpOnly; SameSite=Lax; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60c72b2f9b1e8a5f4c8b4568"
 *                     email:
 *                       type: string
 *                       example: "newuser@example.com"
 *                     username:
 *                       type: string
 *                       example: "newuser123"
 *       400:
 *         description: Bad Request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Note: Currently, provider might let this bubble up as a 500 from controller.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /innogram/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logs out a user
 *     description: Invalidates the user's refresh token (if applicable) and clears the refresh token cookie.
 *     parameters:
 *       - in: header
 *         name: x-internal-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API secret for request validation.
 *         example: your_internal_api_secret
 *       - in: cookie
 *         name: jid
 *         required: true
 *         schema:
 *           type: string
 *         description: The refresh token.
 *     responses:
 *       200:
 *         description: Logout successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jid=; Path=/innogram/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - Refresh token cookie (jid) not provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 */
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
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /innogram/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refreshes an access token
 *     description: Uses a valid refresh token (from cookie) to issue a new access token and a new refresh token.
 *     parameters:
 *       - in: header
 *         name: x-internal-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API secret for request validation.
 *         example: your_internal_api_secret
 *       - in: cookie
 *         name: jid
 *         required: true
 *         schema:
 *           type: string
 *         description: The current refresh token.
 *     responses:
 *       200:
 *         description: Token refresh successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jid=newRefreshToken; Path=/innogram/auth; HttpOnly; SameSite=Lax; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new"
 *       401:
 *         description: Unauthorized - Refresh token cookie (jid) not provided, or token is invalid/expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Note: Provider might let some token errors bubble up as 500 from controller.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /innogram/auth/google-callback:
 *   get:
 *     tags:
 *       - Authentication
 *       - Google OAuth
 *     summary: Handles Google OAuth callback
 *     description: Processes the authorization code from Google, authenticates or registers the user, and returns an access token, user info, and sets a refresh token cookie. This is the redirect URI configured in Google Cloud Console.
 *     parameters:
 *       - in: header
 *         name: x-internal-api-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API secret for request validation.
 *         example: your_internal_api_secret
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The authorization code provided by Google after successful user authentication.
 *         example: "4/0AY0e-g7..."
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: jid=yourRefreshToken; Path=/; HttpOnly; SameSite=None; Secure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Google authentication successful
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 id:
 *                   type: string
 *                   description: Google User ID or application-specific user ID.
 *                   example: "112233445566778899000"
 *                 email:
 *                   type: string
 *                   example: "user.from.google@example.com"
 *                 username:
 *                   type: string
 *                   example: "user.from.google"
 *       400:
 *         description: Bad Request - Authorization code missing.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Google authentication failed (e.g., invalid code, token verification issue).
 *       500:
 *         description: Internal Server Error
 */
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
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Specific error message detailing what went wrong."
 */

export default authController;
