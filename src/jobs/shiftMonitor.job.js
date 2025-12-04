import * as dutyHoursService from '../services/dutyHours.service.js';
import logger from '../utils/logger.js';
import { TESTING_MODE, MONITORING_INTERVAL, TIME_UNIT } from '../../config.testing.js';

/**
 * Monitor active shifts and send alerts
 */
export const monitorShifts = async (io) => {
  try {
    logger.info(`🔍 Running shift monitoring job... (${TIME_UNIT} mode)`);

    // Get all active shifts
    const activeShifts = await dutyHoursService.getActiveShifts();

    if (activeShifts.length === 0) {
      logger.info('No active shifts to monitor');
      return;
    }

    logger.info(`Monitoring ${activeShifts.length} active shifts`);

    for (const shift of activeShifts) {
      try {
        // Calculate current duty hours
        const dutyHours = dutyHoursService.calculateDutyHours(shift.signOnDateTime);

        // Check which alerts need to be sent
        const alerts = dutyHoursService.checkAlertThreshold(dutyHours, shift);

        for (const alert of alerts) {
          // Send alert via socket.io
          await sendAlert(io, shift, alert, dutyHours);

          // Mark alert as sent in database
          await dutyHoursService.markAlertAsSent(shift.id, alert.type);

          // Create duty log entry
          await dutyHoursService.createAlertLog(shift, alert.type, dutyHours);

          logger.info(
            `🚨 Alert sent: ${alert.type} for shift ${shift.id} (Train: ${shift.trainNumber}, Duty ${TIME_UNIT}: ${dutyHours})`
          );
        }
      } catch (error) {
        logger.error(`Error monitoring shift ${shift.id}:`, error);
      }
    }

    logger.info(' Shift monitoring completed');
  } catch (error) {
    logger.error('Error in shift monitoring job:', error);
  }
};

/**
 * Send alert notification via socket.io
 */
const sendAlert = async (io, shift, alert, dutyHours) => {
  const alertData = {
    shiftId: shift.id,
    trainNumber: shift.trainNumber,
    trainName: shift.trainName,
    locomotiveNo: shift.locomotive.locomotiveNo,
    alertType: alert.type,
    dutyHours: dutyHours,
    locoPilot: {
      name: shift.locoPilot.name,
      employeeId: shift.locoPilot.employeeId,
      phone: shift.locoPilot.phone,
    },
    trainManager: {
      name: shift.trainManager.name,
      employeeId: shift.trainManager.employeeId,
      phone: shift.trainManager.phone,
    },
    signOnDateTime: shift.signOnDateTime,
    section: shift.section,
    timestamp: new Date(),
    options: getAlertOptions(alert.type),
  };

  // Emit to all connected clients (or specific room for admins)
  io.emit('dutyAlert', alertData);

  // Also emit to specific shift room if exists
  io.to(`shift:${shift.id}`).emit('dutyAlert', alertData);
};

/**
 * Get available options for each alert type
 */
const getAlertOptions = (alertType) => {
  const timeUnit = TESTING_MODE ? 'minute' : 'hour';
  const timeUnitCap = TESTING_MODE ? 'Minute' : 'Hour';
  
  const options = {
    '7HR': {
      message: `7 ${timeUnitCap} Alert: Duty nearing shift limit`,
      requiresAction: false,
      options: null,
    },
    '8HR': {
      message: `8 ${timeUnitCap} Alert: Plan relief or confirm continuation`,
      requiresAction: true,
      options: [
        { value: 'PLAN_RELIEF', label: 'Plan to get relief', action: 'updates shift status to RELIEF_PLANNED' },
        { value: 'RELIEF_NOT_REQUIRED', label: 'Relief not required', action: 'continues duty' },
      ],
    },
    '9HR': {
      message: `9 ${timeUnitCap} Alert: Critical - Relief status required`,
      requiresAction: true,
      options: [
        { value: 'CREW_RELIEVED', label: 'Crew will be relieved', action: 'completes shift' },
        { value: 'CREW_NOT_BOOKED', label: 'Crew not booked', action: 'escalates issue' },
      ],
    },
    '10HR': {
      message: `10 ${timeUnitCap} Alert: Extended duty - Action required`,
      requiresAction: true,
      options: [
        { value: 'RELIEF_ARRANGED', label: 'Relief arranged', action: 'updates shift to RELIEF_PLANNED' },
        { value: 'CONTINUE_DUTY', label: 'Continue duty (approval required)', action: 'continues with monitoring' },
      ],
    },
    '11HR': {
      message: `11 ${timeUnitCap} Alert: Critical - Immediate action required`,
      requiresAction: true,
      options: [
        { value: 'KEEP_ON', label: 'Keep on duty (emergency)', action: 'continues with critical monitoring' },
        { value: 'CREW_ALREADY_RELIEVED', label: 'Crew already relieved', action: 'completes shift' },
      ],
    },
    '14HR': {
      message: `14 ${timeUnitCap} Alert: MAXIMUM LIMIT REACHED - Emergency action required`,
      requiresAction: true,
      options: [
        { value: 'EMERGENCY_RELIEF', label: 'Emergency relief required', action: 'escalates to emergency' },
        { value: 'SHIFT_ENDING', label: 'Shift ending now', action: 'initiates completion process' },
      ],
    },
  };

  return options[alertType] || { message: 'Unknown alert', requiresAction: false, options: null };
};

/**
 * Start the monitoring job with interval
 */
export const startShiftMonitoring = (io) => {
  const intervalDisplay = TESTING_MODE
    ? `${MONITORING_INTERVAL / 1000} seconds`
    : `${MONITORING_INTERVAL / 60000} minutes`;

  logger.info(`🚀 Starting shift monitoring job (checking every ${intervalDisplay})`);
  
  if (TESTING_MODE) {
    logger.warn('⚠️  TESTING MODE: Using minutes instead of hours for alerts');
  }

  // Run immediately on start
  monitorShifts(io);

  // Then run at intervals
  const intervalId = setInterval(() => {
    monitorShifts(io);
  }, MONITORING_INTERVAL);

  return intervalId;
};

/**
 * Stop the monitoring job
 */
export const stopShiftMonitoring = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
    logger.info('⏹️  Shift monitoring job stopped');
  }
};
