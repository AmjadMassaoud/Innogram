import type { Request, Response, NextFunction } from 'express';
import config from '../configs/config';

const verifyInternalReq = (req: Request, res: any, next: NextFunction) => {
  const internalApiSecret = req.headers['x-internal-api-secret'];

  if (
    !internalApiSecret ||
    internalApiSecret !== config.internalApiSecret.internal_api_secret
  ) {
    return res
      .status(403)
      .json({ error: 'Unauthorized: Invalid internal API secret' });
  }

  next();
};

export default verifyInternalReq;
