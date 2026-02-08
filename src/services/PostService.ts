import { IPostService, CreatePostDto, UpdatePostDto } from '../interfaces/IPostService';
import { Post, PostStatus } from '../models/Post';
import { PostRepository } from '../repositories/PostRepository';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export class PostService implements IPostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  async createPost(data: CreatePostDto): Promise<Post> {
    try {
      logger.info('Creating new post', { title: data.title });
      
      const postData = {
        ...data,
        status: data.status || PostStatus.DRAFT,
      };

      const post = await this.postRepository.create(postData);
      
      logger.info('Post created successfully', { postId: post.id });
      return post;
    } catch (error) {
      logger.error('Error creating post:', error);
      throw new AppError('Failed to create post');
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      logger.info('Fetching post by ID', { postId: id });
      
      const post = await this.postRepository.findById(id);
      
      if (!post) {
        logger.warn('Post not found', { postId: id });
        throw new AppError('Post not found', 404);
      }

      // Increment view count
      post.viewCount += 1;
      await this.postRepository.update(id, { viewCount: post.viewCount });
      
      return post;
    } catch (error) {
      logger.error('Error fetching post:', error);
      throw error;
    }
  }

  async getAllPosts(
    skip: number = 0,
    take: number = 10,
    status?: PostStatus
  ): Promise<Post[]> {
    try {
      logger.info('Fetching all posts', { skip, take, status });
      
      if (status) {
        return await this.postRepository.findByStatus(status, skip, take);
      }
      
      return await this.postRepository.findAll(undefined, skip, take);
    } catch (error) {
      logger.error('Error fetching posts:', error);
      throw new AppError('Failed to fetch posts');
    }
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<Post | null> {
    try {
      logger.info('Updating post', { postId: id, data });
      
      const updatedPost = await this.postRepository.update(id, data);
      
      if (!updatedPost) {
        throw new AppError('Post not found', 404);
      }

      logger.info('Post updated successfully', { postId: id });
      return updatedPost;
    } catch (error) {
      logger.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      logger.info('Deleting post', { postId: id });
      
      await this.postRepository.softDelete(id);
      
      logger.info('Post deleted successfully', { postId: id });
      return true;
    } catch (error) {
      logger.error('Error deleting post:', error);
      throw new AppError('Failed to delete post');
    }
  }

  async getPostCount(status?: PostStatus): Promise<number> {
    try {
      if (status) {
        return await this.postRepository.countByStatus(status);
      }
      
      return await this.postRepository.count();
    } catch (error) {
      logger.error('Error counting posts:', error);
      throw new AppError('Failed to count posts');
    }
  }
}
