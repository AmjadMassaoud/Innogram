import httpStatus from 'http-status';

export class TooManyRequestsError extends Error {
  public status: number;

  constructor(
    message: string = 'Too many reset attempts. Please try again in 1 hour.',
    status: number = httpStatus.TOO_MANY_REQUESTS,
  ) {
    super(message);
    this.name = 'Too many reset attempts. Please try again in 1 hour.';
    this.name = 'TooManyRequestsError';
    this.status = status;
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

export class ResetTokenAlreadyExistsError extends Error {
  public status: number;
  public existingToken?: string; // Optionally, to carry the token if needed by the handler

  constructor(
    message: string = 'A password reset token has already been issued for this email.',
    status: number = httpStatus.CONFLICT,
    existingToken?: string,
  ) {
    super(message);
    this.name = 'ResetTokenAlreadyExistsError';
    this.status = status;
    this.existingToken = existingToken;
    Object.setPrototypeOf(this, ResetTokenAlreadyExistsError.prototype);
  }
}

export class PasswordResetRequestError extends Error {
  public status: number;
  constructor(
    message: string = 'Could not process password reset request.',
    status: number = httpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = 'PasswordResetRequestError';
    this.status = status;
    Object.setPrototypeOf(this, PasswordResetRequestError.prototype);
  }
}
