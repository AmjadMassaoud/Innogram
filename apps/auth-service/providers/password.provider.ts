import { Request, Response } from 'express';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import dataSource from '../configs/orm.config';
import * as crypto from 'crypto';
import httpStatus from 'http-status';
import * as bcrypt from 'bcrypt';
import { passwordResetSchema } from '../schema-validations/password.validation';
import {
  setResetToken,
  getResetToken,
  incrementResetAttempts,
  MAX_ATTEMPTS,
} from '../utils/redis.util';
// Request password reset: generates a reset token and sets expiresAt
export const requestTokenReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const attempts = await incrementResetAttempts(email);
    if (attempts > MAX_ATTEMPTS) {
      return res.status(httpStatus.TOO_MANY_REQUESTS).json({
        message: 'Too many reset attempts. Please try again in 1 hour.',
      });
    }

    const existingToken = await getResetToken(email);
    if (existingToken) {
      return res.status(httpStatus.ALREADY_REPORTED).json({
        message: 'Reset Token is already issued',
        resetToken: existingToken,
      });
    }

    const tokenRepo = dataSource.getRepository(UserAuthEntity);
    const user = await tokenRepo.findOneBy({ email: email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await setResetToken(email, hashedToken);

    const userPasswordResetTokenRepo = dataSource.getRepository(
      PasswordResetTokenEntity,
    );
    const userPassResetTokenRecord = userPasswordResetTokenRepo.create({
      email: user.email,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    });

    await userPasswordResetTokenRepo.save(userPassResetTokenRecord);

    return res.json({
      message: 'Password reset token generated',
      hashedToken,
      attemptsRemaining: MAX_ATTEMPTS - attempts,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Could not process password reset request' });
  }
};

// Reset password: verifies token and updates password
export const resetUserPassword = async (req: Request, res: Response) => {
  // const { email, token, newPassword } = req.body;

  const { error, value } = passwordResetSchema.validate(req.body);

  if (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      error: error.details[0].message,
    });
    return;
  }

  const { email, resetToken, newPassword } = value;

  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const tokenRepo = dataSource.getRepository(UserAuthEntity);
  const userPasswordResetTokenRepo = dataSource.getRepository(
    PasswordResetTokenEntity,
  );

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const userPassTokenRecord = await userPasswordResetTokenRepo.findOneBy({
    email: email,
    hashedToken: hashedToken,
  });

  if (!userPassTokenRecord) {
    return res.status(400).json({ message: 'User/token does not exist' });
  }

  if (userPassTokenRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Token expired' });
  }

  const hashedUserPass = await bcrypt.hash(newPassword, 10);

  const isUpdated = await tokenRepo.update(
    { email: email },
    { password: hashedUserPass },
  );

  if (isUpdated) {
    await userPasswordResetTokenRepo.delete({
      email: email,
      hashedToken: hashedToken,
    });
  }

  return res.status(200).json({ message: 'Password has been reset' });
};
