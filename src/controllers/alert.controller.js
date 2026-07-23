import * as dutyHoursService from '../services/dutyHours.service.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * @desc    Submit response to duty hour alert
 * @route   POST /api/v1/shifts/:id/alert-response
 * @access  Private
 */
export const submitAlertResponse = async (req, res) => {
  try {
    const { id: shiftId } = req.params;
    const { alertType, response, remarks } = req.body;

    const validAlertTypes = ['8HR', '9HR', '10HR', '11HR', '14HR'];
    if (!validAlertTypes.includes(alertType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert type',
      });
    }

    const validResponses = {
      '8HR': ['PLAN_RELIEF', 'RELIEF_NOT_REQUIRED'],
      '9HR': ['CREW_RELIEVED', 'CREW_NOT_BOOKED'],
      '10HR': ['RELIEF_ARRANGED', 'CONTINUE_DUTY'],
      '11HR': ['KEEP_ON', 'CREW_ALREADY_RELIEVED'],
      '14HR': ['EMERGENCY_RELIEF', 'SHIFT_ENDING'],
    };

    if (!validResponses[alertType].includes(response)) {
      return res.status(400).json({
        success: false,
        message: `Invalid response for ${alertType} alert. Valid options: ${validResponses[alertType].join(', ')}`,
      });
    }

    const shift = await dutyHoursService.recordAlertResponse(
      shiftId,
      alertType,
      response,
      remarks
    );

    // emit  socket event for real-time update
    const io = req.app.get('io');
    io.emit('alertResponse', {
      shiftId: shift.id,
      alertType,
      response,
      status: shift.status,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Alert response recorded successfully',
      data: {
        shiftId: shift.id,
        alertType,
        response,
        status: shift.status,
        reliefPlanned: shift.reliefPlanned,
        reliefRequired: shift.reliefRequired,
      },
    });
  } catch (error) {
    logger.error('Submit alert response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit alert response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get alert history for a shift
 * @route   GET /api/v1/shifts/:id/alerts
 * @access  Private
 */
export const getShiftAlertHistory = async (req, res) => {
  try {
    const { id: shiftId } = req.params;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true,
        trainNumber: true,
        signOnDateTime: true,
        alert7HrSent: true,
        alert7HrSentAt: true,
        alert8HrSent: true,
        alert8HrSentAt: true,
        alert8HrResponse: true,
        alert9HrSent: true,
        alert9HrSentAt: true,
        alert9HrResponse: true,
        alert10HrSent: true,
        alert10HrSentAt: true,
        alert10HrResponse: true,
        alert11HrSent: true,
        alert11HrSentAt: true,
        alert11HrResponse: true,
        alert14HrSent: true,
        alert14HrSentAt: true,
        alert14HrResponse: true,
        status: true,
      },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
    }

    // Build alert history
    const alertHistory = [];

    if (shift.alert7HrSent) {
      alertHistory.push({
        type: '7HR',
        sentAt: shift.alert7HrSentAt,
        response: null,
        requiresAction: false,
      });
    }

    if (shift.alert8HrSent) {
      alertHistory.push({
        type: '8HR',
        sentAt: shift.alert8HrSentAt,
        response: shift.alert8HrResponse,
        requiresAction: true,
      });
    }

    if (shift.alert9HrSent) {
      alertHistory.push({
        type: '9HR',
        sentAt: shift.alert9HrSentAt,
        response: shift.alert9HrResponse,
        requiresAction: true,
      });
    }

    if (shift.alert10HrSent) {
      alertHistory.push({
        type: '10HR',
        sentAt: shift.alert10HrSentAt,
        response: shift.alert10HrResponse,
        requiresAction: true,
      });
    }

    if (shift.alert11HrSent) {
      alertHistory.push({
        type: '11HR',
        sentAt: shift.alert11HrSentAt,
        response: shift.alert11HrResponse,
        requiresAction: true,
      });
    }

    if (shift.alert14HrSent) {
      alertHistory.push({
        type: '14HR',
        sentAt: shift.alert14HrSentAt,
        response: shift.alert14HrResponse,
        requiresAction: true,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shiftId: shift.id,
        trainNumber: shift.trainNumber,
        signOnDateTime: shift.signOnDateTime,
        currentDutyHours: dutyHoursService.calculateDutyHours(shift.signOnDateTime),
        status: shift.status,
        alertHistory,
      },
    });
  } catch (error) {
    logger.error('Get shift alert history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve alert history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Complete shift with sign-off details
 * @route   POST /api/v1/shifts/:id/complete
 * @access  Private
 */
export const completeShiftController = async (req, res) => {
  try {
    const { id: shiftId } = req.params;
    const signOffData = req.body;

    const shift = await dutyHoursService.completeShift(shiftId, signOffData);

// socket event 
    const io = req.app.get('io');
    io.emit('shiftCompleted', {
      shiftId: shift.id,
      trainNumber: shift.trainNumber,
      dutyHours: shift.dutyHours,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Shift completed successfully',
      data: {
        id: shift.id,
        trainNumber: shift.trainNumber,
        dutyHours: shift.dutyHours,
        status: shift.status,
        signOffDateTime: shift.signOffDateTime,
        signOffStation: shift.signOffStation,
      },
    });
  } catch (error) {
    logger.error('Complete shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete shift',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// New ALERT CONTROLLER after having BullMQ worker for shift alerts


export const getAllAlertNotifications = async (req, res) => {
  try {
    const { shiftId, trainNumber, type, status } = req.query;

    const where = {};

    if (shiftId) {
      where.shiftId = shiftId;
    }

    if (trainNumber) {
      where.shift = {
        trainNumber: {
          contains: trainNumber,
          mode: 'insensitive',
        },
      };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        shift: {
          select: {
            id: true,
            trainNumber: true,
            signOnDateTime: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
