import { z } from 'zod';
import { UserRole } from '../models/User';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    role: z.enum([UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.SUBSCRIBER]).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    role: z.enum([UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR, UserRole.SUBSCRIBER]),
  }),
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>['body'];
