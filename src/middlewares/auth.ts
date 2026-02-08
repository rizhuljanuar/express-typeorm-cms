import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { UserRole } from '../models/User';
import { logger } from '../utils/logger';

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const jwtService = new JwtService();
    const decoded = jwtService.verifyToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof Error && error.message === 'Token has expired') {
      next(new UnauthorizedError('Token has expired'));
    } else {
      next(new UnauthorizedError('Invalid token'));
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        logger.warn('Authorization failed', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: roles,
        });

        throw new ForbiddenError(
          `Access denied. Required role: ${roles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper middleware to check if user owns the resource or is admin
export const checkOwnership = (userIdParam: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      const resourceUserId = req.params[userIdParam];

      // Allow if user is admin or the owner
      if (req.user.role === UserRole.ADMIN || req.user.id === resourceUserId) {
        next();
      } else {
        throw new ForbiddenError('Access denied. You do not own this resource');
      }
    } catch (error) {
      next(error);
    }
  };
};
