import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationError } from 'joi';

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const error = validationResult.error as ValidationError | undefined;
    const value = validationResult.value as unknown;

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages,
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value as Record<string, unknown>;
    next();
  };
};
