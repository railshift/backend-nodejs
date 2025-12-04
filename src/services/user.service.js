import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users with filtering
 */
export const getAllUsers = async (filters = {}) => {
  const { status, role, isVerified, page = 1, limit = 10 } = filters;
  
  const where = {};
  if (status) where.status = status;
  if (role) where.role = role;
  if (isVerified !== undefined) where.isVerified = isVerified === 'true';
  
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        verifiedAt: true,
        verifiedBy: true,
        rejectedAt: true,
        rejectedBy: true,
        rejectionReason: true,
        division: true,
        designation: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.user.count({ where }),
  ]);
  
  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

/**
 * Get pending user requests (not verified, not rejected)
 */
export const getPendingRequests = async () => {
  const users = await prisma.user.findMany({
    where: {
      isVerified: false,
      rejectedAt: null,
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      division: true,
      designation: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  
  return users;
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isVerified: true,
      verifiedAt: true,
      verifiedBy: true,
      rejectedAt: true,
      rejectedBy: true,
      rejectionReason: true,
      division: true,
      designation: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true,
      _count: {
        select: {
          createdShifts: true,
          updatedShifts: true,
        },
      },
    },
  });
  
  return user;
};

/**
 * Approve user
 */
export const approveUser = async (userId, approvedByEmployeeId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: approvedByEmployeeId,
      status: 'ACTIVE',
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      verifiedAt: true,
      verifiedBy: true,
    },
  });
  
  return user;
};

/**
 * Reject user
 */
export const rejectUser = async (userId, rejectedByEmployeeId, reason) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isVerified: false,
      rejectedAt: new Date(),
      rejectedBy: rejectedByEmployeeId,
      rejectionReason: reason || 'Application rejected by administrator',
      status: 'INACTIVE',
    },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isVerified: true,
      rejectedAt: true,
      rejectedBy: true,
      rejectionReason: true,
    },
  });
  
  return user;
};

/**
 * Change user role
 */
export const changeUserRole = async (userId, newRole) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
  
  return user;
};

/**
 * Update user
 */
export const updateUser = async (userId, updateData) => {
  const { password, ...otherData } = updateData;
  
  const data = { ...otherData };
  
  // Hash password if provided
  if (password) {
    const salt = await bcrypt.genSalt(12);
    data.password = await bcrypt.hash(password, salt);
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      division: true,
      designation: true,
      updatedAt: true,
    },
  });
  
  return user;
};

/**
 * Activate user
 */
export const activateUser = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      status: true,
    },
  });
  
  return user;
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: 'INACTIVE' },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      status: true,
    },
  });
  
  return user;
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  // Check if user has any shifts
  const shiftsCount = await prisma.shift.count({
    where: {
      OR: [
        { createdById: userId },
        { updatedById: userId },
      ],
    },
  });
  
  if (shiftsCount > 0) {
    throw new Error('Cannot delete user with associated shifts. Deactivate instead.');
  }
  
  await prisma.user.delete({
    where: { id: userId },
  });
  
  return true;
};
