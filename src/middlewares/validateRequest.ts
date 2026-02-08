import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation failed:', formattedErrors);
        throw new ValidationError('Validation failed');
      }
      next(error);
    }
  };
};
