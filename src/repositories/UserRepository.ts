import { BaseRepository } from './BaseRepository';
import { User, UserRole } from '../models/User';
import { FindOptionsWhere } from 'typeorm';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.repository.findOne({
        where: { email } as FindOptionsWhere<User>,
      });

      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByRole(role: UserRole, skip: number = 0, take: number = 10): Promise<User[]> {
    try {
      const users = await this.repository.find({
        where: { role } as FindOptionsWhere<User>,
        skip,
        take,
        select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
      });

      return users;
    } catch (error) {
      console.error('Error finding users by role:', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.repository.update(id, { lastLoginAt: new Date() });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}
