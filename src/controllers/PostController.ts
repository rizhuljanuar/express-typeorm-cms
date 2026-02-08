import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/PostService';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import { logger } from '../utils/logger';
import { HTTP_STATUS } from '../constants';

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  createPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const postData: CreatePostDto = req.body;
      const post = await this.postService.createPost(postData);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      logger.error('Error in createPost controller:', error);
      next(error);
    }
  };

  getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;
      const post = await this.postService.getPostById(postId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error('Error in getPostById controller:', error);
      next(error);
    }
  };

  getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skip, take } = req.pagination || { skip: 0, take: 10 };
      const { status } = req.query;

      const posts = await this.postService.getAllPosts(
        skip,
        take,
        status as any
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: posts,
        meta: {
          skip,
          take,
          count: posts.length,
        },
      });
    } catch (error) {
      logger.error('Error in getAllPosts controller:', error);
      next(error);
    }
  };

  updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;
      const updateData: UpdatePostDto = req.body;

      const post = await this.postService.updatePost(postId, updateData);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error) {
      logger.error('Error in updatePost controller:', error);
      next(error);
    }
  };

  deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const postId = Array.isArray(id) ? id[0] : id;
      await this.postService.deletePost(postId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deletePost controller:', error);
      next(error);
    }
  };
}
