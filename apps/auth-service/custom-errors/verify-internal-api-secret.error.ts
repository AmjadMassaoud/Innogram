import httpStatus from 'http-status';

export class InternalApiSecretError extends Error {
  public statusCode: number;

  constructor(
    message: string = 'Unauthorized: Invalid or missing internal API secret',
  ) {
    super(message);
    this.name = 'InternalApiSecretError';
    this.statusCode = httpStatus.FORBIDDEN;

    Object.setPrototypeOf(this, InternalApiSecretError.prototype);
  }
}
