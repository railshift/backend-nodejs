import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import ApiError from './errorHandler.js';
import { asyncHandler } from './errorHandler.js';
import prisma from '../config/database.js';
import redisClient from '../config/redis.js';

// Verify JWT token
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Check if token is blacklisted (logged out) - only if Redis is enabled
    if (config.redis.enabled && redisClient.isConnected) {
      try {
        const redis = redisClient.getClient();
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
          throw new ApiError(401, 'Token has been invalidated');
        }
      } catch (redisError) {
        // If Redis fails, continue without blacklist check (log the error)
        console.warn('Redis blacklist check failed, continuing without it');
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(401, 'User account is not active');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired');
    }
    throw error;
  }
});

// Authorization middleware - check for  user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role ${req.user.role} is not authorized to access this route`
      );
    }

    next();
  };
};

// Check if user is active
export const checkUserStatus = (req, res, next) => {
  if (req.user && req.user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Your account has been suspended or deactivated');
  }
  next();
};
