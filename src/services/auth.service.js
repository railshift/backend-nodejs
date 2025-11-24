import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import config from '../config/config.js';
import ApiError from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

class AuthService {
  // Generate JWT tokens
  generateTokens(user) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return { accessToken, refreshToken };
  }

  // Login
  async login(email, password) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        throw new ApiError(403, 'Your account has been suspended');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      logger.info(`User logged in: ${user.email}`);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      
      logger.info(` Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }
}

export default new AuthService();
