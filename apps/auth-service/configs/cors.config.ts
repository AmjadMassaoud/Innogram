import { type CorsOptions } from 'cors';
import config from './config';
import type { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import cors from 'cors';

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.headers.origin;

  // If no origin, reject the request
  if (!origin) {
    return res.status(403).json({ error: 'Origin header is required' });
  }

  // Check if origin matches allowed origin
  if (origin !== config.cors.cors_origin) {
    return res.status(403).json({
      error: 'CORS error: Origin not allowed',
      allowedOrigin: config.cors.cors_origin,
      receivedOrigin: origin,
    });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.cors.cors_origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
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
  if (err.message === 'Not allowed by CORS') {
    res.status(httpStatus.FORBIDDEN).json({
      error: 'Origin not allowed',
      allowedOrigin: config.cors.cors_origin,
    });
  } else {
    next(err);
  }
};
