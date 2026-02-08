import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { UserRole } from '../models/User';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skip = 0, take = 10 } = req.query;
      const users = await this.userService.getAllUsers(
        Number(skip),
        Number(take)
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: users.map((user) => user.toJSON()),
        meta: {
          skip: Number(skip),
          take: Number(take),
          count: users.length,
        },
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error);
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      logger.error('Error in getUserById controller:', error);
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      const { role } = req.body;

      const user = await this.userService.updateUserRole(userId, role as UserRole);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User role updated successfully',
        data: user?.toJSON(),
      });
    } catch (error) {
      logger.error('Error in updateUserRole controller:', error);
      next(error);
    }
  };

  deactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = Array.isArray(id) ? id[0] : id;
      await this.userService.deactivateUser(userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      logger.error('Error in deactivateUser controller:', error);
      next(error);
    }
  };
}
