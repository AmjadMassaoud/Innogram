import httpStatus from 'http-status';
import dataSource from '../configs/orm.config';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  invalidateRefreshToken,
} from '../utils/token.util';

import { UserAuthEntity } from '../entities/user-auth.entity';
import { hashPassword, verifyPassword } from '../utils/password.util'; // Adjust path if needed
import {
  AuthenticationError,
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../custom-errors/auth.errors';
import {
  LoginReturnType,
  LoginValueParam,
  signupReturnType,
  SignupValueParam,
} from '../interfaces/auth-provider-interfaces/login-value.interface';
import { RefreshTokenReturnTtype } from '../interfaces/auth-provider-interfaces/token.interface';
import { NoTokenProvidedError } from '../custom-errors/token.errors';

const UserAuthRepo = dataSource.getRepository(UserAuthEntity);

export async function handleSignUp(
  value: SignupValueParam,
): Promise<signupReturnType> {
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
    });

    const tokenPayload = {
      userId: user.id.toHexString(),
      email: user.email,
    };

    const accessToken = await generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    return {
      refreshToken,
      accessToken,
      user: {
        id: user.id.toHexString(),
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
  value: LoginValueParam,
): Promise<LoginReturnType> {
  try {
    const { email, password } = value;

    const user = await UserAuthRepo.findOneBy({ email: email });

    if (!user) {
      console.log('why does not throw');
      throw new UserNotFoundError('User not found');
    }

    const validPassword = await verifyPassword(password, user.password);

    if (!validPassword) {
      throw new InvalidCredentialsError('Invalid password');
    }

    const tokenPayload = {
      userId: user.id.toHexString(),
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
        id: user.id.toHexString(),
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
): Promise<RefreshTokenReturnTtype> {
  try {
    const payload = await verifyRefreshToken(token);

    const user = await UserAuthRepo.findOne({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    const tokenPayload = {
      userId: user.id.toHexString(),
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
    await invalidateRefreshToken(token);
  } catch (error) {
    throw new AuthenticationError(
      'Logout failed',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
