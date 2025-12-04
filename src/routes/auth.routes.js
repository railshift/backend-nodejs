import express from 'express';
import { register, login, refreshToken, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user (requires admin approval)
 * @access  Public
 */
router.route('/register').post(
    authLimiter,
    [
      body('employeeId')
        .notEmpty()
        .withMessage('Employee ID is required')
        .trim(),
      body('name')
        .notEmpty()
        .withMessage('Name is required')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      body('phone')
        .optional()
        .trim(),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
      body('division')
        .optional()
        .trim(),
      body('designation')
        .optional()
        .trim(),
      body('role')
        .optional()
        .isIn(['USER', 'ADMIN', 'SUPERADMIN'])
        .withMessage('Role must be USER, ADMIN, or SUPERADMIN'),
    ],
    validate,
    register
  );

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
