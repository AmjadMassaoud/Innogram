import httpStatus from 'http-status'; // Import httpStatus for status hints
import { AuthenticationError } from './auth.errors';

/**
 * Error thrown when Google authentication verification fails (e.g., invalid token, missing payload).
 */
export class GoogleAuthVerificationError extends AuthenticationError {
  constructor(message: string = 'Failed to verify Google user.') {
    super(message, httpStatus.UNAUTHORIZED);
    this.name = 'GoogleAuthVerificationError';
    Object.setPrototypeOf(this, GoogleAuthVerificationError.prototype);
  }
}
