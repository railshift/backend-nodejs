import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  getDashboardStats, 
  getRecentActivities, 
  getShiftTrends,
  getAlertsSummary 
} from '../controllers/dashboard.controller.js';
import { query } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// all dashboard rourtes need authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get comprehensive dashboard statistics
 * @access  Private
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/v1/dashboard/recent-activities
 * @desc    Get recent activities (duty logs)
 * @access  Private
 */
router.get(
  '/recent-activities',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be 0 or greater'),
    query('type').optional().isIn([
      'SIGN_ON', 'SIGN_OFF', 'BREAK_START', 'BREAK_END', 'RELIEF', 
      'ALERT_7HR', 'ALERT_8HR', 'ALERT_9HR', 'ALERT_10HR', 'ALERT_11HR', 'ALERT_14HR',
      'RELIEF_PLANNED', 'RELIEF_NOT_REQUIRED', 'CREW_RELIEVED', 'CREW_NOT_BOOKED',
      'KEEP_ON_DUTY', 'CREW_ALREADY_RELIEVED', 'RELEASE'
    ]).withMessage('Invalid activity type')
  ],
  validate,
  getRecentActivities
);

/**
 * @route   GET /api/v1/dashboard/trends
 * @desc    Get shift trends for charts (last N days)
 * @access  Private
 */
router.get(
  '/trends',
  [
    query('days').optional().isInt({ min: 1, max: 90 }).withMessage('Days must be between 1 and 90')
  ],
  validate,
  getShiftTrends
);

/**
 * @route   GET /api/v1/dashboard/alerts-summary
 * @desc    Get summary of active alerts
 * @access  Private
 */
router.get('/alerts-summary', getAlertsSummary);

export default router;
