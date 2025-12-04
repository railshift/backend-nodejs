import { asyncHandler } from '../middleware/errorHandler.js';
import shiftService from '../services/shift.service.js';
import ApiError from '../middleware/errorHandler.js';

// Create new shift
export const createShift = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const shift = await shiftService.createShift(req.body, userId);

  // Emit socket event for new shift
  const io = req.app.get('io');
  if (io) {
    io.emit('shift:created', {
      shiftId: shift.id,
      trainNumber: shift.trainNumber,
      locoPilot: shift.locoPilot.name,
      trainManager: shift.trainManager.name,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Shift created successfully',
    data: shift,
  });
});

// Get shift by ID
export const getShiftById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const shift = await shiftService.getShiftById(id);

  res.status(200).json({
    success: true,
    data: shift,
  });
});

// List shifts
export const listShifts = asyncHandler(async (req, res) => {
  const { status, trainNumber, locoPilotId, trainManagerId, startDate, endDate } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const filters = {};
  if (status) filters.status = status;
  if (trainNumber) filters.trainNumber = trainNumber;
  if (locoPilotId) filters.locoPilotId = locoPilotId;
  if (trainManagerId) filters.trainManagerId = trainManagerId;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const result = await shiftService.listShifts(filters, page, limit);

  res.status(200).json({
    success: true,
    data: result.shifts,
    pagination: result.pagination,
  });
});

// Update shift
export const updateShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const shift = await shiftService.updateShift(id, req.body, userId);

  // Emit socket event for shift update
  const io = req.app.get('io');
  if (io) {
    io.to(`shift:${id}`).emit('shift:updated', {
      shiftId: shift.id,
      status: shift.status,
      dutyHours: shift.dutyHours,
      reliefPlanned: shift.reliefPlanned,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Shift updated successfully',
    data: shift,
  });
});

// Delete shift
export const deleteShift = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await shiftService.deleteShift(id);

  res.status(200).json({
    success: true,
    message: 'Shift deleted successfully',
  });
});

// Get active shifts summary
export const getActiveShiftsSummary = asyncHandler(async (req, res) => {
  const summary = await shiftService.getActiveShiftsSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
});
