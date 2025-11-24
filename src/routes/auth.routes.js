import express from 'express';
import { login, refreshToken, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.route('/login').post(
    authLimiter,
    [
      body('email').isEmail().withMessage('Please provide a valid email'),
      body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
  );

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.route('/refresh').post(
    [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
    validate,
    refreshToken
  );

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.route('/me').get(authenticate, getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.route('/logout').post(authenticate, logout);

export default router;
