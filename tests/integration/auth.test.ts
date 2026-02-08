import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/models/User';
import { UserService } from '../../src/services/UserService';

describe('Auth API Integration Tests', () => {
  const app = createApp();
  const userService = new UserService();

  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    // Clear database before each test
    await AppDataSource.getRepository(User).clear();
  });

  afterEach(async () => {
    // Cleanup after each test
    await AppDataSource.getRepository(User).clear();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return validation error for invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for weak password', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return conflict error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a test user before login tests
      const userData = {
        email: 'test@example.com',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await userService.register(userData);
      testUser = result.user;
      authToken = result.token;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test12345',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test12345',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await userService.register(userData);
      testUser = result.user;
      authToken = result.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/posts (Authentication)', () => {
    beforeEach(async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test12345',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.AUTHOR,
      };

      const result = await userService.register(userData);
      authToken = result.token;
    });

    it('should create post with authentication', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('authorId');
    });

    it('should return error without authentication', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test content',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
