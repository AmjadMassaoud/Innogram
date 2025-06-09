import { UserAuthEntity } from '../entities/user-auth.entity';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import dataSource from '../configs/orm.config';
import * as crypto from 'crypto';
import httpStatus from 'http-status';
import {
  setResetToken,
  getResetToken,
  incrementResetAttempts,
  MAX_ATTEMPTS,
} from '../utils/redis.util';
import { hashPassword } from '../utils/password.util';
import {
  RequestTokenResetReturnType,
  ResetUserPasswordValueParam,
} from '../interfaces/password-provider-interfaces/password-provider.interface';
import {
  PasswordResetRequestError,
  ResetTokenAlreadyExistsError,
  TooManyRequestsError,
} from '../custom-errors/password.errors';
import { UserNotFoundError } from '../custom-errors/auth.errors';
import {
  NoTokenProvidedError,
  TokenExpiredError,
} from '../custom-errors/token.errors';

// Request password reset: generates a reset token and sets expiresAt
export const requestTokenReset = async (
  email: string,
): Promise<RequestTokenResetReturnType> => {
  try {
    const attempts = await incrementResetAttempts(email);
    if (attempts > MAX_ATTEMPTS) {
      throw new TooManyRequestsError(
        'Too many reset attempts. Please try again in 1 hour.',
        httpStatus.TOO_MANY_REQUESTS,
      );
    }

    const existingToken = await getResetToken(email);
    if (existingToken) {
      throw new ResetTokenAlreadyExistsError(
        'A password reset token has already been issued for this email. Please check your email or try again later.',
        httpStatus.CONFLICT,
      );
    }

    const userAuthRepo = dataSource.getRepository(UserAuthEntity);
    const user = await userAuthRepo.findOneBy({ email: email });

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

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

    return {
      message: 'Password reset token generated',
      hashedToken,
      attemptsRemaining: MAX_ATTEMPTS - attempts,
    };
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      throw error;
    }

    if (error instanceof ResetTokenAlreadyExistsError) {
      throw error;
    }

    if (error instanceof UserNotFoundError) {
      throw error;
    }

    throw new PasswordResetRequestError(
      'Could not process password reset request due to an internal error.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

// Reset password: verifies token and updates password
export const resetUserPassword = async (
  value: ResetUserPasswordValueParam,
): Promise<string> => {
  const { email, resetToken, newPassword } = value;

  try {
    const userAuthRepo = dataSource.getRepository(UserAuthEntity);

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
      throw new NoTokenProvidedError();
    }

    if (userPassTokenRecord.expiresAt < new Date()) {
      throw new TokenExpiredError();
    }

    const hashedPassword = await hashPassword(newPassword);

    const user = await userAuthRepo.findOneBy({ email: email });

    if (!user) {
      throw new UserNotFoundError();
    }

    const isUpdated = await userAuthRepo.update(
      { email: email },
      { password: hashedPassword },
    );

    if (isUpdated.affected) {
      await userPasswordResetTokenRepo.delete({
        email: email,
        hashedToken: hashedToken,
      });

      return 'Password reset successful';
    } else {
      throw new PasswordResetRequestError();
    }
  } catch (error) {
    if (error instanceof NoTokenProvidedError) {
      throw error;
    }

    if (error instanceof TokenExpiredError) {
      throw error;
    }

    if (error instanceof UserNotFoundError) {
      throw error;
    }

    throw new Error('An internal server error occurred during password reset.');
  }
};
