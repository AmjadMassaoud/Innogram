import httpStatus from 'http-status';
import dataSource from '../configs/orm.config';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
} from './token.service';

import { UserAuthEntity } from '../entities/user-auth.entity';
import { hashPassword, verifyPassword } from '../utils/password.util';
import {
  AuthenticationError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../custom-errors/auth.errors';
import {
  ILoginReturnType,
  ILoginValueParam,
  TSignupReturnType,
  ISignupValueParam,
} from '../common/interfaces/auth-provider-interfaces/login-value.interface';
import { IRefreshTokenReturn } from '../common/interfaces/auth-provider-interfaces/token.interface';
import { NoTokenProvidedError } from '../custom-errors/token.errors';
import { ERegistrationMethod } from '../common/enums/registration-method.enum';

const UserAuthRepo = dataSource.getRepository(UserAuthEntity);

export async function handleSignUp(
  value: ISignupValueParam,
): Promise<TSignupReturnType> {
  try {
    const { email, password, username } = value;

    // Check if user already exists
    const userExists = await UserAuthRepo.findOneBy({ email });
    if (userExists) {
      throw new UserAlreadyExistsError();
    }

    const hashedPassword = await hashPassword(password);

    const user = await UserAuthRepo.save({
      email: email,
      password: hashedPassword,
      username,
      registrationMethod: ERegistrationMethod.EMAIL,
    });

    const tokenPayload = {
      userId: user.id.toString(),
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    return {
      refreshToken,
      accessToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      throw new AuthenticationError(error.message, httpStatus.UNAUTHORIZED);
    }

    if (error instanceof UserAlreadyExistsError) {
      throw error;
    }

    throw new AuthenticationError(
      'An internal server error occurred during login.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function handleLogin(
  value: ILoginValueParam,
): Promise<ILoginReturnType> {
  try {
    const { email, password } = value;

    const user = await UserAuthRepo.findOneBy({ email: email });

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    const validPassword = await verifyPassword(password, user.password);

    if (!validPassword) {
      throw new InvalidCredentialsError('Invalid password');
    }

    const tokenPayload = {
      userId: user.id.toString(),
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    await UserAuthRepo.update(
      { email: email },
      {
        refreshToken: refreshToken,
      },
    );

    return {
      refreshToken,
      accessToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
      },
    };
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw error;
    }

    if (error instanceof InvalidCredentialsError) {
      throw error;
    }

    // For all other unexpected errors
    throw new AuthenticationError(
      'An internal server error occurred during login.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function handleRefreshToken(
  token: string,
): Promise<IRefreshTokenReturn> {
  try {
    const payload = await verifyRefreshToken(token);

    const user = await UserAuthRepo.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    const tokenPayload = {
      userId: user.id.toString(),
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    await invalidateRefreshToken(token);

    return { refreshToken, accessToken };
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      throw error;
    }

    if (error instanceof NoTokenProvidedError) {
      throw new NoTokenProvidedError();
    }

    throw new AuthenticationError(
      'An internal server error occurred during login.',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export async function handleLogout(token: string): Promise<void> {
  try {
    const payload = await verifyRefreshToken(token);

    const user = await UserAuthRepo.findOneBy({ id: payload.userId });

    if (
      user &&
      user.registrationMethod === ERegistrationMethod.GOOGLE &&
      user.googleRefreshToken
    ) {
      try {
        const params = new URLSearchParams();
        params.append('token', user.googleRefreshToken);

        const revokeResponse = await fetch(
          'https://oauth2.googleapis.com/revoke',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
          },
        );

        if (revokeResponse.ok) {
          user.googleRefreshToken = undefined;
          await UserAuthRepo.save(user);
        } else {
          const errorBody = await revokeResponse.json();
          throw new Error(errorBody.error_description);
        }
      } catch (error) {
        if (error! instanceof InvalidCredentialsError) {
          throw error;
        }
      }
    }

    await invalidateRefreshToken(token);
  } catch (error) {
    throw error;
  }
}
