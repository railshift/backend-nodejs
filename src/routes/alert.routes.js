import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getAllAlertNotifications } from '../controllers/alert.controller.js';

const router = express.Router();

// auth for every routes
router.use(authenticate);

/**
 * @route   GET /api/v1/alerts
 * @desc    Get all alerts for the authenticated user
 * @access  Private (All authenticated users)
 */
router.route('/').get(getAllAlertNotifications);

export default router;
