import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';

export const catchErrors = (
  err: any,
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const statusCode =
    err.status || err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred.',
  });
};
