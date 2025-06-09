import httpStatus from 'http-status';
import { AuthenticationError } from './auth.errors';

export class TokenExpiredError extends Error {
  statusCode: number;

  constructor(
    message: string = 'Token has expired',
    statusCode: number = httpStatus.UNAUTHORIZED,
  ) {
    super(message);
    this.name = 'TokenExpiredError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

/**
 * Error thrown when a logout attempt is made without a valid token.
 */
export class NoTokenProvidedError extends AuthenticationError {
  constructor(message: string = 'No token provided') {
    super(message, 400);
    this.name = 'NoTokenProvidedError';
    Object.setPrototypeOf(this, NoTokenProvidedError.prototype);
  }
}
