import { User, UserRole } from '../models/User';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<User>;
  token: string;
}

export interface IUserService {
  register(data: RegisterDto): Promise<AuthResponse>;
  login(data: LoginDto): Promise<AuthResponse>;
  getUserById(id: string): Promise<User | null>;
  getAllUsers(skip?: number, take?: number): Promise<User[]>;
  updateUserRole(id: string, role: UserRole): Promise<User | null>;
  deactivateUser(id: string): Promise<boolean>;
}
