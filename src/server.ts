import { createApp } from './app';
import { initializeDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`📚 API Base: http://localhost:${env.PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`⚠️  ${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('✅ HTTP server closed');
        
        try {
          // Close database connection
          const { AppDataSource } = await import('./config/database');
          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('✅ Database connection closed');
          }
          
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
