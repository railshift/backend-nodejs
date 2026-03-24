import { httpServer, io } from './app.js';
import config from './config/config.js';
import logger from './utils/logger.js';
import prisma from './config/database.js';
import redisClient from './config/redis.js';
import seedDatabase from './utils/seed.js';
import { startShiftMonitoring, stopShiftMonitoring } from './jobs/shiftMonitor.job.js';
import { logConfiguration } from '../config.testing.js';

// Initialize Database Connections

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getDatabaseHost() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return 'unknown-host';
    return new URL(databaseUrl).hostname;
  } catch {
    return 'unknown-host';
  }
}

async function connectDatabase() {
  const maxAttempts = parseInt(process.env.DB_CONNECT_MAX_RETRIES || '8', 10);
  const baseDelayMs = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '2000', 10);
  const dbHost = getDatabaseHost();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      logger.info(`Database connected successfully (${dbHost})`);
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;
      const delayMs = Math.min(baseDelayMs * attempt, 15000);

      logger.error(`Database connection failed (attempt ${attempt}/${maxAttempts})`, {
        message: error?.message,
        code: error?.code,
        host: dbHost,
      });

      if (isLastAttempt) {
        logger.error('Exhausted database connection retries. Shutting down.');
        process.exit(1);
      }

      logger.warn(`Retrying database connection in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }
}

async function connectRedis() {
  // Check if Redis is enabled
  if (!config.redis.enabled) {  // from config ;
    logger.info(' Redis disabled - running without cache');
    return;
  }

  try {
    const client = redisClient.connect();
    
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
      )
    ]);
    
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.warn('Redis not available - running without cache (this is fine for development , we can run without redis also )');
    // Don't exit - redis is optional for basic functionality
  }
}



async function startServer() {
  try {
    await connectDatabase();


    // Connect to Redis 
    await connectRedis();

    // Log testing 
    logConfiguration(logger);

    // Start shift monitoring job 
    if (config.features.monitoringEnabled) {  ////checking config that needed or not 
      monitoringIntervalId = startShiftMonitoring(io);
      logger.info('Shift monitoring job started');
    } else {
      logger.info('Monitoring disabled (monitoringEnabled=false)');
    }

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
      if (config.features.socketEnabled) {
        logger.info(` Socket.io enabled on port: ${config.port}`);
      } else {
        logger.info(' Socket.io disabled (socketEnabled=false)');
      }
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

let monitoringIntervalId = null;

// Graceful Shutdown


async function gracefulShutdown(signal) {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Stop shift monitoring job
    if (monitoringIntervalId) {
      stopShiftMonitoring(monitoringIntervalId);
    }

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