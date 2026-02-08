import { BaseRepository } from './BaseRepository';
import { Post, PostStatus } from '../models/Post';
import { FindOptionsWhere } from 'typeorm';

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post);
  }

  async findByStatus(status: PostStatus, skip: number = 0, take: number = 10): Promise<Post[]> {
    const filter = { status } as FindOptionsWhere<Post>;
    return this.findAll(filter, skip, take);
  }

  async countByStatus(status: PostStatus): Promise<number> {
    const filter = { status } as FindOptionsWhere<Post>;
    return this.count(filter);
  }

  async searchByTitle(title: string, skip: number = 0, take: number = 10): Promise<Post[]> {
    try {
      const posts = await this.repository
        .createQueryBuilder('post')
        .where('post.title LIKE :title', { title: `%${title}%` })
        .skip(skip)
        .take(take)
        .orderBy('post.createdAt', 'DESC')
        .getMany();

      return posts;
    } catch (error) {
      console.error('Error searching posts by title:', error);
      throw error;
    }
  }
}
