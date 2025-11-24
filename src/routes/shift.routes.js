import express from 'express';
import {createShift, getShiftById, listShifts, updateShift, deleteShift, getActiveShiftsSummary,} from '../controllers/shift.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createShiftValidation,
  updateShiftValidation,
  getShiftByIdValidation,
  listShiftsValidation,
} from '../validators/shift.validator.js';
import { shiftCreationLimiter } from '../middleware/rateLimiter.js';

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

export default router;
