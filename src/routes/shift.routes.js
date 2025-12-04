import express from 'express';
import {createShift, getShiftById, listShifts, updateShift, deleteShift, getActiveShiftsSummary,} from '../controllers/shift.controller.js';
import { submitAlertResponse, getShiftAlertHistory, completeShiftController } from '../controllers/alert.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createShiftValidation,
  updateShiftValidation,
  getShiftByIdValidation,
  listShiftsValidation,
} from '../validators/shift.validator.js';
import { shiftCreationLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';

const router = express.Router();

// auth for every routes
router.use(authenticate);

/**
 * @route   GET /api/v1/shifts/active/summary
 * @desc    Get summary of all active shifts
 * @access  Private (All authenticated users)
 */
router.route('/active/summary').get(getActiveShiftsSummary);

/**
 * @route   GET /api/v1/shifts
 * @route   POST /api/v1/shifts
 * @desc    List all shifts OR Create new shift
 * @access  Private (All for GET, Admin/SuperAdmin for POST)
 */
router.route('/')
  .get(listShiftsValidation, validate, listShifts)
  .post(
    authorize('ADMIN', 'SUPERADMIN'),
    shiftCreationLimiter,
    createShiftValidation,
    validate,
    createShift
  );

/**
 * @route   GET /api/v1/shifts/:id
 * @route   PATCH /api/v1/shifts/:id
 * @route   DELETE /api/v1/shifts/:id
 * @desc    Get/Update/Delete shift by ID
 * @access  Private (All for GET, Admin/SuperAdmin for PATCH, SuperAdmin for DELETE)
 */
router.route('/:id')
  .get(getShiftByIdValidation, validate, getShiftById)
  .patch(
    authorize('ADMIN', 'SUPERADMIN'),
    updateShiftValidation,
    validate,
    updateShift
  )
  .delete(
    authorize('SUPERADMIN'),
    getShiftByIdValidation,
    validate,
    deleteShift
  );

/**
 * @route   POST /api/v1/shifts/:id/alert-response
 * @desc    Submit response to duty hour alert
 * @access  Private (Admin/SuperAdmin)
 */
router.post(
  '/:id/alert-response',
  authorize('ADMIN', 'SUPERADMIN'),
  [
    body('alertType')
      .isIn(['8HR', '9HR', '10HR', '11HR', '14HR'])
      .withMessage('Invalid alert type'),
    body('response').notEmpty().withMessage('Response is required'),
    body('remarks').optional().isString(),
  ],
  validate,
  submitAlertResponse
);

/**
 * @route   GET /api/v1/shifts/:id/alerts
 * @desc    Get alert history for a shift
 * @access  Private
 */
router.get('/:id/alerts', getShiftByIdValidation, validate, getShiftAlertHistory);

/**
 * @route   POST /api/v1/shifts/:id/complete
 * @desc    Complete shift with sign-off details
 * @access  Private (Admin/SuperAdmin)
 */
router.post(
  '/:id/complete',
  authorize('ADMIN', 'SUPERADMIN'),
  [
    body('signOffDateTime').isISO8601().withMessage('Valid sign-off date time is required'),
    body('signOffStation').notEmpty().withMessage('Sign-off station is required'),
  ],
  validate,
  completeShiftController
);

export default router;
