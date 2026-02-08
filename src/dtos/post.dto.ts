import { z } from 'zod';
import { PostStatus } from '../models/Post';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
    featuredImage: z.string().url('Featured image must be a valid URL').optional(),
    status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
    featuredImage: z.string().url('Featured image must be a valid URL').optional(),
    status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]).optional(),
  }),
});

export const getPostSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid post ID format'),
  }),
});

export const listPostsSchema = z.object({
  query: z.object({
    skip: z.string().transform(Number).refine((val) => val >= 0, 'Skip must be non-negative').optional(),
    take: z.string().transform(Number).refine((val) => val > 0 && val <= 100, 'Take must be between 1 and 100').optional(),
    status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]).optional(),
  }),
});

export type CreatePostDto = z.infer<typeof createPostSchema>['body'];
export type UpdatePostDto = z.infer<typeof updatePostSchema>['body'];
export type GetPostParams = z.infer<typeof getPostSchema>['params'];
export type ListPostsQuery = z.infer<typeof listPostsSchema>['query'];
