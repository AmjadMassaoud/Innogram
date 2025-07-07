import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { CorsOriginNotAllowedError } from '../custom-errors/cors-original-not-allowed.error';

export const corsErrorHandler = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CorsOriginNotAllowedError) {
    res.status(httpStatus.FORBIDDEN).json({
      error: err.message,
      allowedOrigin: err.allowedOrigin,
      receivedOrigin: err.receivedOrigin,
    });
  } else {
    next(err);
  }
};
