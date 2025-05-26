import { Request, Response } from 'express';
import { TokenEntity } from '../entities/token-entity';
import dataSource from '../configs/orm.config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

// Request password reset: generates a reset token and sets expiresAt
export const requestTokenReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const tokenRepo = dataSource.getRepository(TokenEntity);

  const user = await tokenRepo.findOne({ where: { userEmail: email } });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.refreshToken = hashedToken;

  user.expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await tokenRepo.save(user);

  // In production, send resetToken via email. For now, return it.
  return res.json({ message: 'Password reset token generated', resetToken });
};

// Reset password: verifies token and updates password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const tokenRepo = dataSource.getRepository(TokenEntity);

  const user = await tokenRepo.findOne({ where: { userEmail: email } });

  if (!user || !user.refreshToken || !user.expiresAt) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  if (user.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Token expired' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  if (user.refreshToken !== hashedToken) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.userPassword = await bcrypt.hash(newPassword, 10);
  user.refreshToken = '';
  user.expiresAt = new Date();

  await tokenRepo.save(user);

  return res.json({ message: 'Password has been reset' });
};
