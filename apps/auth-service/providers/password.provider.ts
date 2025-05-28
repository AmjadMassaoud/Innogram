import { Request, Response } from 'express';
import { TokenEntity } from '../entities/token-entity';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import dataSource from '../configs/orm.config';
import * as crypto from 'crypto';
import httpStatus from 'http-status';
import * as bcrypt from 'bcrypt';
import { passwordResetSchema } from '../schema-validations/password.validation';

// Request password reset: generates a reset token and sets expiresAt
export const requestTokenReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const tokenRepo = dataSource.getRepository(TokenEntity);
  const userPasswordResetTokenRepo = dataSource.getRepository(
    PasswordResetTokenEntity,
  );

  const user = await tokenRepo.findOneBy({ userEmail: email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const tokenAlreadyissued = await userPasswordResetTokenRepo.findOneBy({
    userEmail: user.userEmail,
  });

  if (tokenAlreadyissued) {
    return res
      .status(httpStatus.ALREADY_REPORTED)
      .json({ message: 'Reset Token is already issued' });
  }

  try {
    const userPassResetTokenRecord = userPasswordResetTokenRepo.create({
      userEmail: user.userEmail,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    });

    if (userPassResetTokenRecord) {
      await userPasswordResetTokenRepo.save(userPassResetTokenRecord);
    }
  } catch {
    throw new Error('Could not save user password reset token!');
  }

  // to be handled by API-GATEWAY
  return res.json({ message: 'Password reset token generated', resetToken });
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

  const tokenRepo = dataSource.getRepository(TokenEntity);
  const userPasswordResetTokenRepo = dataSource.getRepository(
    PasswordResetTokenEntity,
  );

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const userPassTokenRecord = await userPasswordResetTokenRepo.findOneBy({
    userEmail: email,
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
    { userEmail: email },
    { userPassword: hashedUserPass },
  );

  if (isUpdated) {
    await userPasswordResetTokenRepo.delete({
      userEmail: email,
      hashedToken: hashedToken,
    });
  }

  return res.status(200).json({ message: 'Password has been reset' });
};
