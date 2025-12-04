import * as userService from '../services/user.service.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (SUPERADMIN only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { status, role, isVerified, page, limit } = req.query;
    
    const result = await userService.getAllUsers({
      status,
      role,
      isVerified,
      page,
      limit,
    });
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get pending user requests
 * @route   GET /api/v1/users/pending-requests
 * @access  Private (SUPERADMIN only)
 */
export const getPendingRequests = async (req, res) => {
  try {
    const users = await userService.getPendingRequests();
    
    res.status(200).json({
      success: true,
      data: {
        pendingRequests: users,
        count: users.length,
      },
    });
  } catch (error) {
    logger.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (SUPERADMIN only)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Approve user
 * @route   POST /api/v1/users/:id/approve
 * @access  Private (SUPERADMIN only)
 */
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const approvedBy = req.user.employeeId;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if already verified
    if (existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }
    
    const user = await userService.approveUser(id, approvedBy);
    
    logger.info(`User ${user.employeeId} approved by ${approvedBy}`);
    
    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Reject user
 * @route   POST /api/v1/users/:id/reject
 * @access  Private (SUPERADMIN only)
 */
export const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectedBy = req.user.employeeId;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    const user = await userService.rejectUser(id, rejectedBy, reason);
    
    logger.info(`User ${user.employeeId} rejected by ${rejectedBy}`);
    
    res.status(200).json({
      success: true,
      message: 'User rejected successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Change user role
 * @route   PATCH /api/v1/users/:id/role
 * @access  Private (SUPERADMIN only)
 */
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Prevent changing own role
    if (existingUser.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own role',
      });
    }
    
    const user = await userService.changeUserRole(id, role);
    
    logger.info(`User ${user.employeeId} role changed to ${role} by ${req.user.employeeId}`);
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Change user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update user
 * @route   PATCH /api/v1/users/:id
 * @access  Private (SUPERADMIN only)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Remove fields that shouldn't be updated via this endpoint
    delete updateData.isVerified;
    delete updateData.verifiedAt;
    delete updateData.verifiedBy;
    delete updateData.rejectedAt;
    delete updateData.rejectedBy;
    delete updateData.role; // Use separate endpoint for role changes
    
    const user = await userService.updateUser(id, updateData);
    
    logger.info(`User ${user.employeeId} updated by ${req.user.employeeId}`);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Activate user
 * @route   POST /api/v1/users/:id/activate
 * @access  Private (SUPERADMIN only)
 */
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    const user = await userService.activateUser(id);
    
    logger.info(`User ${user.employeeId} activated by ${req.user.employeeId}`);
    
    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Deactivate user
 * @route   POST /api/v1/users/:id/deactivate
 * @access  Private (SUPERADMIN only)
 */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Prevent deactivating own account
    if (existingUser.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate your own account',
      });
    }
    
    const user = await userService.deactivateUser(id);
    
    logger.info(`User ${user.employeeId} deactivated by ${req.user.employeeId}`);
    
    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (SUPERADMIN only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Prevent deleting own account
    if (existingUser.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }
    
    await userService.deleteUser(id);
    
    logger.info(`User ${existingUser.employeeId} deleted by ${req.user.employeeId}`);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    
    if (error.message.includes('Cannot delete user with associated shifts')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
