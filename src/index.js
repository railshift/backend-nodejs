import { httpServer } from './app.js';
import config from './config/config.js';
import logger from './utils/logger.js';
import prisma from './config/database.js';
import redisClient from './config/redis.js';
import seedDatabase from './utils/seed.js';

// ============================================
// Initialize Database Connections
// ============================================

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error( 'Database connection failed:', error);
    process.exit(1);
  }
}

async function connectRedis() {
  // Check if Redis is enabled
  if (!config.redis.enabled) {
    logger.info(' Redis disabled - running without cache');
    return;
  }

  try {
    const client = redisClient.connect();
    
    // Try to connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
      )
    ]);
    
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.warn('Redis not available - running without cache (this is fine for development)');
    // Don't exit - Redis is optional for basic functionality
  }
}

// Start Server
// ============================================

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Seed database with default users
    await seedDatabase();

    // Connect to Redis (optional)
    await connectRedis();

    // Start HTTP server
    const server = httpServer.listen(config.port, () => {
      logger.info('='.repeat(50));
      logger.info(`Railway Shift Management System`);
      logger.info('='.repeat(50));
      logger.info(`Environment: ${config.env}`);
      logger.info(`Server running on port: ${config.port}`);
      logger.info(`API URL: http://localhost:${config.port}/api/${config.apiVersion}`);
      logger.info(` Health Check: http://localhost:${config.port}/health`);
      logger.info(`Metrics: http://localhost:${config.port}/metrics`);
      logger.info(` Socket.io enabled on port: ${config.port}`);
      logger.info('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
// ============================================

async function gracefulShutdown(signal) {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close HTTP server
    httpServer.close(() => {
      logger.info('HTTP server closed');
    });

    // Disconnect from database
    await prisma.$disconnect();
    logger.info('Database disconnected');

    // Disconnect from Redis
    await redisClient.disconnect();
    logger.info('Redis disconnected');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Process Event Handlers
// ============================================

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(' UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(error);
  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));



startServer();