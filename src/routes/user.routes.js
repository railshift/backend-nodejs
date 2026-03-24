import express from 'express';
import {
  getAllUsers,
  getPendingRequests,
  getUserById,
  approveUser,
  rejectUser,
  changeUserRole,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// alll routes ; authentication + SUPERADMIN role
router.use(authenticate, authorize('SUPERADMIN'));

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filtering
 * @access  Private (SUPERADMIN only)
 */
router.get('/', getAllUsers);

/**
 * @route   GET /api/v1/users/pending-requests
 * @desc    Get pending user requests
 * @access  Private (SUPERADMIN only)
 */
router.get('/pending-requests', getPendingRequests);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (SUPERADMIN only)
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  getUserById
);

/**
 * @route   POST /api/v1/users/:id/approve
 * @desc    Approve user
 * @access  Private (SUPERADMIN only)
 */
router.post(
  '/:id/approve',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  approveUser
);

/**
 * @route   POST /api/v1/users/:id/reject
 * @desc    Reject user
 * @access  Private (SUPERADMIN only)
 */
router.post(
  '/:id/reject',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
  ],
  validate,
  rejectUser
);

/**
 * @route   PATCH /api/v1/users/:id/role
 * @desc    Change user role
 * @access  Private (SUPERADMIN only)
 */
router.patch(
  '/:id/role',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('role')
      .isIn(['USER', 'ADMIN', 'SUPERADMIN'])
      .withMessage('Role must be USER, ADMIN, or SUPERADMIN'),
  ],
  validate,
  changeUserRole
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (SUPERADMIN only)
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('division').optional().isString().withMessage('Division must be a string'),
    body('designation').optional().isString().withMessage('Designation must be a string'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  updateUser
);

/**
 * @route   POST /api/v1/users/:id/activate
 * @desc    Activate user
 * @access  Private (SUPERADMIN only)
 */
router.post(
  '/:id/activate',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  activateUser
);

/**
 * @route   POST /api/v1/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Private (SUPERADMIN only)
 */
router.post(
  '/:id/deactivate',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  deactivateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (SUPERADMIN only)
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid user ID')],
  validate,
  deleteUser
);

export default router;
