/**
 * Base class for authentication-related errors.
 * Allows adding custom properties like status code hints.
 */
export class AuthenticationError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error thrown when login credentials (email/password) are invalid.
 */
export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401);
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

/**
 * Error thrown when a user is not found.
 * Could be used in other service functions as well.
 */
export class UserNotFoundError extends AuthenticationError {
  constructor(message: string = 'User not found') {
    super(message, 404);
    this.name = 'UserNotFoundError';
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

/**
 * Error thrown when attempting to create a user that already exists.
 */
export class UserAlreadyExistsError extends AuthenticationError {
  constructor(message: string = 'User with this email already exists') {
    super(message, 409); // 409 Conflict is a suitable status code
    this.name = 'UserAlreadyExistsError';
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}
