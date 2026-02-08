import { Post, PostStatus } from '../models/Post';
import { DeepPartial } from 'typeorm';

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

export interface IPostService {
  createPost(data: CreatePostDto): Promise<Post>;
  getPostById(id: string): Promise<Post | null>;
  getAllPosts(skip?: number, take?: number, status?: PostStatus): Promise<Post[]>;
  updatePost(id: string, data: UpdatePostDto): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
  getPostCount(status?: PostStatus): Promise<number>;
}
