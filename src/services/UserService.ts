import { IUserService, RegisterDto, LoginDto, AuthResponse } from '../interfaces/IUserService';
import { User, UserRole } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AppError, NotFoundError, UnauthorizedError, ConflictError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { JwtService } from '../utils/jwt';

export class UserService implements IUserService {
  private userRepository: UserRepository;
  private jwtService: JwtService;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtService = new JwtService();
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      logger.info('Registering new user', { email: data.email });

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      const userData = {
        ...data,
        role: data.role || UserRole.SUBSCRIBER,
      };

      const user = await this.userRepository.create(userData);

      // Generate JWT token
      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User registered successfully', { userId: user.id });

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    try {
      logger.info('User login attempt', { email: data.email });

      // Find user by email
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(data.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User logged in successfully', { userId: user.id });

      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      logger.error('Error logging in user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findById(id);
      return user;
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw new AppError('Failed to fetch user');
    }
  }

  async getAllUsers(skip: number = 0, take: number = 10): Promise<User[]> {
    try {
      return await this.userRepository.findAll(undefined, skip, take);
    } catch (error) {
      logger.error('Error fetching all users:', error);
      throw new AppError('Failed to fetch users');
    }
  }

  async updateUserRole(id: string, role: UserRole): Promise<User | null> {
    try {
      const updatedUser = await this.userRepository.update(id, { role });

      if (!updatedUser) {
        throw new NotFoundError('User not found');
      }

      logger.info('User role updated', { userId: id, newRole: role });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<boolean> {
    try {
      const updatedUser = await this.userRepository.update(id, { isActive: false });

      if (!updatedUser) {
        throw new NotFoundError('User not found');
      }

      logger.info('User deactivated', { userId: id });
      return true;
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }
}
