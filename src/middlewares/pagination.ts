import { Request, Response, NextFunction } from 'express';
import { PAGINATION } from '../constants';

export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const skip = req.query.skip
    ? Math.max(0, parseInt(req.query.skip as string))
    : PAGINATION.DEFAULT_SKIP;

  const take = req.query.take
    ? Math.min(
        parseInt(req.query.take as string),
        PAGINATION.MAX_TAKE
      )
    : PAGINATION.DEFAULT_TAKE;

  req.pagination = {
    skip,
    take,
  };

  next();
};
