import type { Request, NextFunction } from 'express';
import config from '../configs/config';
import { InternalApiSecretError } from '../custom-errors/verify-internal-api-secret.error';

const verifyInternalReq = (req: Request, res: any, next: NextFunction) => {
  const internalApiSecret = req.headers['x-internal-api-secret'];

  if (
    !internalApiSecret ||
    internalApiSecret !== config.internalApiSecret.internal_api_secret
  ) {
    throw new InternalApiSecretError();
  }

  next();
};

export default verifyInternalReq;
