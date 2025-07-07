import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { throwError } from 'rxjs'; // <-- Import throwError from RxJS

/**
 * Handles an AxiosError and transforms it into a NestJS HttpException.
 * This centralizes the error handling logic for all HTTP calls.
 *
 * @param error The AxiosError caught from an httpService call.
 * @returns An instance of HttpException.
 */
export const handleAxiosError = (error: AxiosError) => {
  const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

  const responseData = error.response?.data as any;
  const message =
    responseData?.message ||
    responseData?.error ||
    (typeof responseData === 'string' ? responseData : error.message) ||
    'An unexpected error occurred with the downstream service.';

  const httpException = new HttpException(
    {
      statusCode: status,
      message: message,
      error: error.response?.statusText || 'Internal Server Error',
    },
    status,
  );

  return throwError(() => httpException);
};
