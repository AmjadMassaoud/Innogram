import { Router } from 'express';
import {
  requestTokenReset,
  resetUserPassword,
} from '../providers/password.provider';
import type { Request, Response } from 'express';
import { passwordResetSchema } from '../schema-validations/password.validation';

const router = Router();

/**
 * @openapi
 * /innogram/password/request-reset:
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Requests a password reset token
 *     description: Initiates the password reset process for a user by generating a unique token and sending it (typically via email, though this endpoint returns the hashed token for now).
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset token generated
 *                 hashedToken:
 *                   type: string
 *                   description: The hashed version of the reset token (the actual token would typically be sent to the user's email).
 *                   example: "a1b2c3d4e5f6..."
 *                 attemptsRemaining:
 *                   type: integer
 *                   example: 4
 *       400:
 *         description: Bad Request - Email is required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not Found - User with the provided email does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Note: Provider throws UserNotFoundError, controller's current catch re-throws it, potentially leading to 500 if not handled by a global error middleware.
 *       409:
 *         description: Conflict - A password reset token has already been issued for this email.
 *       429:
 *         description: Too Many Requests - Too many reset attempts.
 *       500:
 *         description: Internal Server Error - Could not process password reset request.
 */
router.post('/request-reset', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) res.status(400).json({ message: 'Email is required' });

  try {
    const { attemptsRemaining, hashedToken, message } =
      await requestTokenReset(email);

    res.json({
      message,
      hashedToken,
      attemptsRemaining,
    });
  } catch (error) {
    throw error;
  }
});

/**
 * @openapi
 * /innogram/password/reset:
 *   post:
 *     tags:
 *       - Password Management
 *     summary: Resets user password using a token
 *     description: Allows a user to set a new password using a valid reset token.
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
 *               - resetToken
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               resetToken:
 *                 type: string
 *                 description: The password reset token received by the user.
 *                 example: "plaintextresettoken123abc"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: "newSecurePassword456"
 *     responses:
 *       200:
 *         description: Password reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Bad Request - Invalid input data, token missing, or token expired.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' # Note: Provider throws NoTokenProvidedError/TokenExpiredError, controller's current catch re-throws it, potentially leading to 500.
 *       404:
 *         description: Not Found - User not found or token record not found.
 *       500:
 *         description: Internal Server Error - An error occurred during password reset.
 */
router.post('/reset', async (req: Request, res: Response) => {
  const { error, value } = passwordResetSchema.validate(req.body);

  if (error) {
    throw error;
  }

  try {
    const reseted: string = await resetUserPassword(value);

    if (reseted) {
      res.json({ message: reseted });
    }
  } catch (error) {
    throw error;
  }
});

export default router;
