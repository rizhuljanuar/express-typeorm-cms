import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData: RegisterDto = req.body;
      const authResponse = await this.userService.register(registerData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: authResponse,
      });
    } catch (error) {
      logger.error('Error in register controller:', error);
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginDto = req.body;
      const authResponse = await this.userService.login(loginData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful',
        data: authResponse,
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await this.userService.getUserById(req.user.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: user?.toJSON(),
      });
    } catch (error) {
      logger.error('Error in getProfile controller:', error);
      next(error);
    }
  };
}
