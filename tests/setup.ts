import { beforeAll, afterAll } from 'vitest';
import { AppDataSource } from '../src/config/database';

beforeAll(async () => {
  // Setup test database connection
  const testDataSource = new AppDataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'cms_test_db',
    synchronize: true,
    logging: false,
  });

  await testDataSource.initialize();
});

afterAll(async () => {
  // Close database connection
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
