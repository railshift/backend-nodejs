import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { TESTING_MODE, TIME_DIVISOR, TIME_UNIT } from '../../config.testing.js';

/**
 * Calculate duty hours (or minutes in testing mode) from sign-on time
 */
export const calculateDutyHours = (signOnDateTime) => {
  const now = new Date();
  const signOn = new Date(signOnDateTime);
  const diffMs = now - signOn;
  const dutyTime = diffMs / TIME_DIVISOR;
  return parseFloat(dutyTime.toFixed(2));
};

/**
 * Get all active shifts that need monitoring
 */
export const getActiveShifts = async () => {
  const shifts = await prisma.shift.findMany({
    where: {
      status: {
        in: ['IN_PROGRESS', 'SCHEDULED', 'RELIEF_PLANNED'],
      },
      signOffDateTime: null, // Not yet signed off
    },
    include: {
      locoPilot: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          phone: true,
          division: true,
        },
      },
      trainManager: {
        select: {
          id: true,
          employeeId: true,
          name: true,
          phone: true,
          division: true,
        },
      },
      locomotive: {
        select: {
          locomotiveNo: true,
        },
      },
    },
  });

  return shifts;
};

/**
 * Check which alert threshold a shift has reached
 */
export const checkAlertThreshold = (dutyHours, shift) => {
  const alerts = [];
  const unit = TESTING_MODE ? 'minutes' : 'hours';

  // 7 hour/minute alert
  if (dutyHours >= 7 && !shift.alert7HrSent) {
    alerts.push({ type: '7HR', threshold: 7, unit });
  }

  // 8 hour/minute alert
  if (dutyHours >= 8 && !shift.alert8HrSent) {
    alerts.push({ type: '8HR', threshold: 8, unit });
  }

  // 9 hour/minute alert
  if (dutyHours >= 9 && !shift.alert9HrSent) {
    alerts.push({ type: '9HR', threshold: 9, unit });
  }

  // 10 hour/minute alert
  if (dutyHours >= 10 && !shift.alert10HrSent) {
    alerts.push({ type: '10HR', threshold: 10, unit });
  }

  // 11 hour/minute alert
  if (dutyHours >= 11 && !shift.alert11HrSent) {
    alerts.push({ type: '11HR', threshold: 11, unit });
  }

  // 14 hour/minute alert
  if (dutyHours >= 14 && !shift.alert14HrSent) {
    alerts.push({ type: '14HR', threshold: 14, unit });
  }

  return alerts;
};

/**
 * Mark alert as sent
 */
export const markAlertAsSent = async (shiftId, alertType) => {
  const updateData = {};
  const now = new Date();

  switch (alertType) {
    case '7HR':
      updateData.alert7HrSent = true;
      updateData.alert7HrSentAt = now;
      break;
    case '8HR':
      updateData.alert8HrSent = true;
      updateData.alert8HrSentAt = now;
      break;
    case '9HR':
      updateData.alert9HrSent = true;
      updateData.alert9HrSentAt = now;
      break;
    case '10HR':
      updateData.alert10HrSent = true;
      updateData.alert10HrSentAt = now;
      break;
    case '11HR':
      updateData.alert11HrSent = true;
      updateData.alert11HrSentAt = now;
      break;
    case '14HR':
      updateData.alert14HrSent = true;
      updateData.alert14HrSentAt = now;
      break;
  }

  await prisma.shift.update({
    where: { id: shiftId },
    data: updateData,
  });
};

/**
 * Record alert response and update shift status accordingly
 */
export const recordAlertResponse = async (shiftId, alertType, response, remarks = null) => {
  const updateData = {};
  let logType = null;
  let statusUpdate = null;

  switch (alertType) {
    case '8HR':
      updateData.alert8HrResponse = response;
      if (response === 'PLAN_RELIEF') {
        updateData.reliefPlanned = true;
        updateData.reliefRequired = true;
        statusUpdate = 'RELIEF_PLANNED';
        logType = 'RELIEF_PLANNED';
      } else if (response === 'RELIEF_NOT_REQUIRED') {
        updateData.reliefRequired = false;
        logType = 'RELIEF_NOT_REQUIRED';
      }
      break;

    case '9HR':
      updateData.alert9HrResponse = response;
      if (response === 'CREW_RELIEVED') {
        statusUpdate = 'COMPLETED';
        logType = 'CREW_RELIEVED';
      } else if (response === 'CREW_NOT_BOOKED') {
        logType = 'CREW_NOT_BOOKED';
      }
      break;

    case '10HR':
      updateData.alert10HrResponse = response;
      if (response === 'RELIEF_ARRANGED') {
        updateData.reliefPlanned = true;
        statusUpdate = 'RELIEF_PLANNED';
        logType = 'RELIEF_PLANNED';
      } else if (response === 'CONTINUE_DUTY') {
        logType = 'KEEP_ON_DUTY';
      }
      break;

    case '11HR':
      updateData.alert11HrResponse = response;
      if (response === 'KEEP_ON') {
        logType = 'KEEP_ON_DUTY';
      } else if (response === 'CREW_ALREADY_RELIEVED') {
        statusUpdate = 'COMPLETED';
        logType = 'CREW_ALREADY_RELIEVED';
      }
      break;

    case '14HR':
      updateData.alert14HrResponse = response;
      if (response === 'EMERGENCY_RELIEF') {
        updateData.reliefRequired = true;
        updateData.reliefPlanned = true;
        statusUpdate = 'RELIEF_PLANNED';
        logType = 'RELIEF_PLANNED';
      } else if (response === 'SHIFT_ENDING') {
        logType = 'RELEASE';
      }
      break;
  }

  // Update shift status if needed
  if (statusUpdate) {
    updateData.status = statusUpdate;
  }

  // Update shift
  const shift = await prisma.shift.update({
    where: { id: shiftId },
    data: updateData,
    include: {
      locoPilot: true,
      trainManager: true,
    },
  });

  // Create duty log entry for both crew members
  if (logType) {
    const dutyHours = calculateDutyHours(shift.signOnDateTime);

    await prisma.dutyLog.createMany({
      data: [
        {
          shiftId: shift.id,
          staffId: shift.locoPilotId,
          logType: logType,
          dutyHoursAtLog: dutyHours,
          remarks: remarks || `${alertType} alert response: ${response}`,
          metadata: {
            alertType,
            response,
            timestamp: new Date().toISOString(),
          },
        },
        {
          shiftId: shift.id,
          staffId: shift.trainManagerId,
          logType: logType,
          dutyHoursAtLog: dutyHours,
          remarks: remarks || `${alertType} alert response: ${response}`,
          metadata: {
            alertType,
            response,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    });
  }

  logger.info(`Alert response recorded for shift ${shiftId}: ${alertType} - ${response}`);

  return shift;
};

/**
 * Create duty log for alert
 */
export const createAlertLog = async (shift, alertType, dutyHours) => {
  const logTypeMap = {
    '7HR': 'ALERT_7HR',
    '8HR': 'ALERT_8HR',
    '9HR': 'ALERT_9HR',
    '10HR': 'ALERT_10HR',
    '11HR': 'ALERT_11HR',
    '14HR': 'ALERT_14HR',
  };

  const logType = logTypeMap[alertType];

  if (!logType) {
    logger.error(`Unknown alert type: ${alertType}`);
    return;
  }

  // Create log for both loco pilot and train manager
  await prisma.dutyLog.createMany({
    data: [
      {
        shiftId: shift.id,
        staffId: shift.locoPilotId,
        logType: logType,
        dutyHoursAtLog: dutyHours,
        remarks: `${alertType} duty hour alert triggered`,
        metadata: {
          trainNumber: shift.trainNumber,
          locomotiveNo: shift.locomotive.locomotiveNo,
          alertType,
          timestamp: new Date().toISOString(),
        },
      },
      {
        shiftId: shift.id,
        staffId: shift.trainManagerId,
        logType: logType,
        dutyHoursAtLog: dutyHours,
        remarks: `${alertType} duty hour alert triggered`,
        metadata: {
          trainNumber: shift.trainNumber,
          locomotiveNo: shift.locomotive.locomotiveNo,
          alertType,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  });

  logger.info(`Duty log created for ${alertType} alert - Shift: ${shift.id}`);
};

/**
 * Update shift status when completed
 */
export const completeShift = async (shiftId, signOffData) => {
  const { signOffDateTime, signOffStation } = signOffData;

  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: { signOnDateTime: true },
  });

  if (!shift) {
    throw new Error('Shift not found');
  }

  // Calculate duty hours
  const dutyHours = calculateDutyHours(shift.signOnDateTime);

  const updatedShift = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      signOffDateTime: new Date(signOffDateTime),
      signOffStation,
      dutyHours,
      status: 'COMPLETED',
    },
    include: {
      locoPilot: true,
      trainManager: true,
    },
  });

  // Create release log for both crew members
  await prisma.dutyLog.createMany({
    data: [
      {
        shiftId: updatedShift.id,
        staffId: updatedShift.locoPilotId,
        logType: 'RELEASE',
        dutyHoursAtLog: dutyHours,
        remarks: 'Shift completed and crew released',
      },
      {
        shiftId: updatedShift.id,
        staffId: updatedShift.trainManagerId,
        logType: 'RELEASE',
        dutyHoursAtLog: dutyHours,
        remarks: 'Shift completed and crew released',
      },
    ],
  });

  // Update staff status === AVAILABLE
  await prisma.staff.updateMany({
    where: {
      id: {
        in: [updatedShift.locoPilotId, updatedShift.trainManagerId],
      },
    },
    data: {
      status: 'AVAILABLE',
    },
  });

  logger.info(`Shift ${shiftId} completed with ${dutyHours} duty hours`);

  return updatedShift;
};
