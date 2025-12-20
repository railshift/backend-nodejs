import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import config from './config/config.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { register } from './config/metrics.js';
import { initializeSocket } from './socket/index.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io (Not for Phase 1 , for phase 2 )
let io = null;
if (config.features.socketEnabled) {  //checking config that socket enabled or not 
  io = new Server(httpServer, {
    cors: {
      origin: "https://railway-project-frontend.vercel.app",
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // socket handlers
  initializeSocket(io);

  // Make io accessible to routes
  app.set('io', io);
}

// Security Middleware
// ============================================

// Helmet 
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS 
app.use(cors(config.cors));

// Compression middleware
app.use(compression());

// Logging & Monitoring

// HTTP request logger
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Prometheus metrics middleware
app.use(metricsMiddleware);

// ============================================
// Body Parser Middleware

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
// ============================================

// Apply rate limiting to all routes
app.use('/api', apiLimiter);


// Health Check & Metrics
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// API Routes
// ============================================

const API_PREFIX = `/api/${config.apiVersion}`;

app.get(API_PREFIX, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Railway Shift Management API',
    version: config.apiVersion,
    documentation: `${API_PREFIX}/docs`,
  });
});

// Mount routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/shifts`, shiftRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

// Error Handling
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);



export { app, httpServer, io };
