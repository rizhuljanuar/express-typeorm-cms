import { Repository, FindOptionsWhere, ObjectLiteral, DeepPartial } from 'typeorm';
import { AppDataSource } from '../config/database';
import { IRepository } from '../interfaces/IRepository';
import { NotFoundError } from '../utils/AppError';
import { logger } from '../utils/logger';

export abstract class BaseRepository<T extends ObjectLiteral> implements IRepository<T> {
  protected repository: Repository<T>;

  constructor(entity: { new (): T }) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      const savedEntity = await this.repository.save(entity);
      logger.info(`Entity created successfully: ${JSON.stringify(savedEntity)}`);
      return savedEntity;
    } catch (error) {
      logger.error('Error creating entity:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
        withDeleted: false,
      });

      if (!entity) {
        throw new NotFoundError(`Entity with id ${id} not found`);
      }

      return entity;
    } catch (error) {
      logger.error(`Error finding entity by id ${id}:`, error);
      throw error;
    }
  }

  async findAll(filter?: FindOptionsWhere<T>, skip: number = 0, take: number = 10): Promise<T[]> {
    try {
      const entities = await this.repository.find({
        where: filter,
        skip,
        take,
        order: { createdAt: 'DESC' } as any,
      });

      logger.info(`Found ${entities.length} entities`);
      return entities;
    } catch (error) {
      logger.error('Error finding all entities:', error);
      throw error;
    }
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    try {
      const entity = await this.findById(id);

      if (!entity) {
        throw new NotFoundError(`Entity with id ${id} not found`);
      }

      this.repository.merge(entity, data);
      const updatedEntity = await this.repository.save(entity);
      logger.info(`Entity updated successfully: ${JSON.stringify(updatedEntity)}`);
      return updatedEntity;
    } catch (error) {
      logger.error(`Error updating entity with id ${id}:`, error);
      throw error;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.repository.softDelete(id);
      
      if (result.affected === 0) {
        throw new NotFoundError(`Entity with id ${id} not found`);
      }

      logger.info(`Entity soft deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error soft deleting entity with id ${id}:`, error);
      throw error;
    }
  }

  async count(filter?: FindOptionsWhere<T>): Promise<number> {
    try {
      const count = await this.repository.count({ where: filter });
      logger.info(`Entity count: ${count}`);
      return count;
    } catch (error) {
      logger.error('Error counting entities:', error);
      throw error;
    }
  }
}
