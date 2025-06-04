import httpStatus from 'http-status';

export class CorsOriginNotAllowedError extends Error {
  public statusCode: number;
  public allowedOrigin: string | undefined;
  public receivedOrigin: string | undefined;

  constructor(
    message: string = 'CORS error: Origin not allowed',
    allowedOrigin?: string,
    receivedOrigin?: string,
  ) {
    super(message);
    this.name = 'CorsOriginNotAllowedError';
    this.statusCode = httpStatus.FORBIDDEN;
    this.allowedOrigin = allowedOrigin;
    this.receivedOrigin = receivedOrigin;
    Object.setPrototypeOf(this, CorsOriginNotAllowedError.prototype);
  }
}
