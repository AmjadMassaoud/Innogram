import config from './config';
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { CorsOriginNotAllowedError } from '../custom-errors/cors-original-not-allowed.error';

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.headers.origin;

  // If no origin, reject the request
  if (!origin) {
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ error: 'Origin header is required' });
  }

  if (origin !== config.cors.cors_origin) {
    return next(
      new CorsOriginNotAllowedError(undefined, config.cors.cors_origin, origin),
    );
  }

  res.setHeader('Access-Control-Allow-Origin', config.cors.cors_origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

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
      receivedOrigin: err.receivedOrigin, // If you added this to your custom error
    });
  } else {
    next(err);
  }
};
