import * as dutyHoursService from '../services/dutyHours.service.js';
import logger from '../utils/logger.js';
import prisma from '../config/database.js';
import { TESTING_MODE, MONITORING_INTERVAL, TIME_UNIT } from '../../config.testing.js';

/**
 * Monitor active shifts and send alerts
 */
export const monitorShifts = async (io) => {
  try {
    logger.info(` Running shift monitoring job... (${TIME_UNIT} mode)`);

    const activeShifts = await dutyHoursService.getActiveShifts();

    if (activeShifts.length === 0) {
      logger.info('No active shifts to monitor');
      return;
    }

    logger.info(`Monitoring ${activeShifts.length} active shifts`);

    for (const shift of activeShifts) {
      try {
        const dutyHours = dutyHoursService.calculateDutyHours(shift.signOnDateTime);

        // Update dutyHours in database , in each monitoring 
        await prisma.shift.update({
          where: { id: shift.id },
          data: { dutyHours },
        });

        // Check which alerts need to be sent
        const alerts = dutyHoursService.checkAlertThreshold(dutyHours, shift);

        for (const alert of alerts) {
          // Get target admins BEFORE sending alert
          // TODO : not working correctly for user designations 
          const division = shift.locoPilot.division || shift.trainManager.division || 'GENERAL';
          const allAdmins = await prisma.user.findMany({
            where: {
              role: { in: ['ADMIN', 'SUPERADMIN'] },
              status: 'ACTIVE',
              isVerified: true,
              division: division,
            },
            select: {
              id: true,
              name: true,
              employeeId: true,
              role: true,
              designation: true,
              priority: true,
              division: true,
            },
            orderBy: { priority: 'desc' },
          });

          // Filter admins based on designation (OFFICER, SUPERVISOR, CHASER for now) threshold
          const targetAdmins = allAdmins.filter(admin => {
            if (admin.role === 'SUPERADMIN') return true;
            if (admin.role === 'ADMIN' && admin.designation) {
              const threshold = getAlertThresholdForDesignation(admin.designation);
              return dutyHours >= threshold;
            }
            return false;
          });

          // Only send alert if there are admins to receive it
          if (targetAdmins.length > 0) {
            // Send alert via socket.io
            await sendAlert(io, shift, alert, dutyHours, targetAdmins, division);

            // Mark alert as sent in database (update shift record)
            await dutyHoursService.markAlertAsSent(shift.id, alert.type);

            // ++ duty log entry
            await dutyHoursService.createAlertLog(shift, alert.type, dutyHours);

            logger.info(
              ` Alert sent: ${alert.type} for shift ${shift.id} (Train: ${shift.trainNumber}, Duty ${TIME_UNIT}: ${dutyHours}, Recipients: ${targetAdmins.length})`
            );
          } else {
            logger.info(
              ` Alert suppressed: ${alert.type} for shift ${shift.id} - no admins qualified (dutyHours=${dutyHours})`
            );
          }
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
 * Get alert threshold for admin designation
 * OFFICER designation: all alerts (7HR+)
 * SUPERVISOR designation: 10HR alerts and above
 * CHASER designation: 12HR alerts and above
 */
const getAlertThresholdForDesignation = (designation) => {
  const thresholds = {
    'OFFICER': 7,   // All alerts from 7HR++
    'SUPERVISOR': 10,  // Alerts >= 10HR
    'CHASER': 12,  // Alerts >=   12HR
  };
  return thresholds[designation] || 7; // Default to 7 if unknown
};

/**
 * Check if admin should receive alert based on designation and duty hours
 */
const shouldAdminReceiveAlert = (adminDesignation, dutyHours) => {
  const threshold = getAlertThresholdForDesignation(adminDesignation);
  const shouldReceive = dutyHours >= threshold;
  logger.info(`Checking admin designation ${adminDesignation}: dutyHours=${dutyHours}, threshold=${threshold}, shouldReceive=${shouldReceive}`);
  return shouldReceive;
};

/**
 * Send alert notification via socket.io
 */
const sendAlert = async (io, shift, alert, dutyHours, targetAdmins, division) => {

  const alertData = {
    shiftId: shift.id,
    trainNumber: shift.trainNumber,
    trainName: shift.trainName,
    locomotiveNo: shift.locomotive.locomotiveNo,
    alertType: alert.type,
    dutyHours: dutyHours,
    division: division,
    locoPilot: {
      name: shift.locoPilot.name,
      employeeId: shift.locoPilot.employeeId,
      phone: shift.locoPilot.phone,
      division: shift.locoPilot.division,
    },
    trainManager: {
      name: shift.trainManager.name,
      employeeId: shift.trainManager.employeeId,
      phone: shift.trainManager.phone,
      division: shift.trainManager.division,
    },
    signOnDateTime: shift.signOnDateTime,
    section: shift.section,
    timestamp: new Date(),
    targetAdmins: targetAdmins.map(admin => ({
      id: admin.id,
      name: admin.name,
      employeeId: admin.employeeId,
      role: admin.role,
      designation: admin.designation,
      priority: admin.priority,
    })),
    options: getAlertOptions(alert.type),
  };

  // Determine priority based on alert type
  const priority = ['11HR', '14HR'].includes(alert.type) ? 2 : 
                   ['9HR', '10HR'].includes(alert.type) ? 1 : 0;

  //  notification record in database
  try {
    await prisma.notification.create({
      data: {
        shiftId: shift.id,
        type: alert.type.includes('8') ? 'DUTY_8HR' :
              alert.type.includes('9') ? 'DUTY_9HR' :
              alert.type.includes('11') ? 'DUTY_11HR' :
              alert.type.includes('12') ? 'DUTY_12HR' :
              alert.type.includes('14') ? 'DUTY_14HR' : 'CUSTOM',
        title: `${alert.type} Alert - Train #${shift.trainNumber}`,
        message: `Duty ${TIME_UNIT}: ${dutyHours.toFixed(2)} - ${getAlertOptions(alert.type).message}`,
        dutyHours: dutyHours,
        targetDivision: division,
        targetUsers: targetAdmins.map(admin => admin.id),
        priority: priority,
        status: 'SENT',
        sentAt: new Date(),
        metadata: {
          alertType: alert.type,
          shift: {
            trainNumber: shift.trainNumber,
            locomotiveNo: shift.locomotive.locomotiveNo,
            section: shift.section,
          },
          crew: {
            locoPilot: shift.locoPilot.name,
            trainManager: shift.trainManager.name,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to create notification record:', error);
  }

  // Emit alerts ONLY to filtered target admins based on designation threshold
  // (remove role-based broadcasts to prevent bypass of designation filtering)
  
  // Emit to each target admin individually (based on designation and duty hours)
  targetAdmins.forEach(admin => {
    io.to(`user:${admin.id}`).emit('dutyAlert', {
      ...alertData,
      targetPriority: admin.priority,
    });
  });


  io.to(`shift:${shift.id}`).emit('dutyAlert', alertData);
  
  logger.info(
    ` Alert sent to ${targetAdmins.length} filtered admins (Division: ${division}, Alert Type: ${alert.type}, Duty Hours: ${dutyHours})`
  );
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

  logger.info(` Starting shift monitoring job (checking every ${intervalDisplay})`);
  
  if (TESTING_MODE) {
    logger.warn('  TESTING MODE: Using minutes instead of hours for alerts');
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
    logger.info('  Shift monitoring job stopped');
  }
};
