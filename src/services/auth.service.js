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
      { userId: user.id,},
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData) {
    try {
      const { employeeId, name, email, phone, password, division, designation, role } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { employeeId }],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new ApiError(400, 'Email already registered');
        }
        if (existingUser.employeeId === employeeId) {
          throw new ApiError(400, 'Employee ID already exists');
        }
      }

      // user can request role while creating account ; admin will approve
      const requestedRole = role && ['USER', 'ADMIN', 'SUPERADMIN'].includes(role) ? role : 'USER';
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user (status: INACTIVE, isVerified: false)
      const user = await prisma.user.create({
        data: {
          employeeId,
          name,
          email,
          phone,
          password: hashedPassword,
          division,
          designation,
          role: requestedRole, // User's requested role (pending approval)
          status: 'INACTIVE', // Inactive until approved
          isVerified: false, // Requires admin approval (super admin only)
        },
        select: {
          id: true,
          employeeId: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          isVerified: true,
          division: true,
          designation: true,
          createdAt: true,
        },
      });

      logger.info(`New user registered: ${user.email} (pending approval)`);

      return { user };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login
  async login(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Check if user is verified
      if (!user.isVerified) {
        throw new ApiError(403, 'Your account is pending approval by administrator');
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        throw new ApiError(403, 'Your account has been suspended or deactivated');
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
