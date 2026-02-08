import { EntityTarget, ObjectLiteral, FindOptionsWhere, DeepPartial } from 'typeorm';

export interface IRepository<T extends ObjectLiteral> {
  create(data: DeepPartial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filter?: FindOptionsWhere<T>, skip?: number, take?: number): Promise<T[]>;
  update(id: string, data: DeepPartial<T>): Promise<T | null>;
  softDelete(id: string): Promise<boolean>;
  count(filter?: FindOptionsWhere<T>): Promise<number>;
}
