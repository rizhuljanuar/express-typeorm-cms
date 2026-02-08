import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/User';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export class JwtService {
  private secret: string;

  constructor() {
    this.secret = env.JWT_SECRET || 'your-super-secret-key-change-in-production';
  }

  generateToken(payload: JwtPayload): string {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: '7d',
      });

      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Failed to generate token');
    }
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
