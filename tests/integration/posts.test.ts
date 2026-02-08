import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { Post } from '../../src/models/Post';

describe('Posts API Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    // Clear database before each test
    await AppDataSource.getRepository(Post).clear();
  });

  afterEach(async () => {
    // Cleanup after each test
    await AppDataSource.getRepository(Post).clear();
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const postData = {
        title: 'Test Post',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        status: 'draft',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(postData.title);
      expect(response.body.data.content).toBe(postData.content);
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        title: '',
        content: '',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get a post by ID', async () => {
      // Create a test post
      const postRepository = AppDataSource.getRepository(Post);
      const post = postRepository.create({
        title: 'Test Post',
        content: 'Test content',
      });
      await postRepository.save(post);

      const response = await request(app)
        .get(`/api/posts/${post.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(post.id);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts with pagination', async () => {
      // Create test posts
      const postRepository = AppDataSource.getRepository(Post);
      for (let i = 1; i <= 15; i++) {
        const post = postRepository.create({
          title: `Test Post ${i}`,
          content: `Test content ${i}`,
        });
        await postRepository.save(post);
      }

      const response = await request(app)
        .get('/api/posts?skip=0&take=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta.skip).toBe(0);
      expect(response.body.meta.take).toBe(10);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update a post', async () => {
      const postRepository = AppDataSource.getRepository(Post);
      const post = postRepository.create({
        title: 'Original Title',
        content: 'Original content',
      });
      await postRepository.save(post);

      const updateData = {
        title: 'Updated Title',
      };

      const response = await request(app)
        .patch(`/api/posts/${post.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should soft delete a post', async () => {
      const postRepository = AppDataSource.getRepository(Post);
      const post = postRepository.create({
        title: 'Test Post',
        content: 'Test content',
      });
      await postRepository.save(post);

      await request(app)
        .delete(`/api/posts/${post.id}`)
        .expect(200);

      // Verify soft delete
      const deletedPost = await postRepository.findOne({
        where: { id: post.id },
        withDeleted: true,
      });

      expect(deletedPost).toBeDefined();
      expect(deletedPost?.deletedAt).not.toBeNull();
    });
  });
});
