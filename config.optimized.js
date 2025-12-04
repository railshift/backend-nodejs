/**
 * OPTIMIZED MONITORING CONFIGURATION
 * 
 * This configuration includes various optimization strategies to minimize
 * resource usage and costs while maintaining alert reliability.
 */

export const TESTING_MODE = process.env.TESTING_MODE === 'true' || false;

// ============================================
// MONITORING INTERVALS
// ============================================

// Standard intervals
export const MONITORING_INTERVAL = TESTING_MODE 
  ? parseInt(process.env.MONITORING_INTERVAL_SECONDS || '30') * 1000  // Default: 30 seconds
  : parseInt(process.env.MONITORING_INTERVAL_MINUTES || '5') * 60 * 1000; // Default: 5 minutes

// Adaptive intervals (optional feature)
export const ADAPTIVE_MONITORING = process.env.ADAPTIVE_MONITORING === 'true' || false;

// When no active shifts, check less frequently
export const IDLE_INTERVAL = TESTING_MODE
  ? 60 * 1000  // 60 seconds when idle (testing)
  : 15 * 60 * 1000; // 15 minutes when idle (production)

// When approaching alert threshold, check more frequently
export const CRITICAL_INTERVAL = TESTING_MODE
  ? 15 * 1000  // 15 seconds when critical (testing)
  : 2 * 60 * 1000; // 2 minutes when critical (production)

// ============================================
// ALERT THRESHOLDS
// ============================================

export const ALERT_THRESHOLDS = {
  '7HR': TESTING_MODE ? 7 : 7,
  '8HR': TESTING_MODE ? 8 : 8,
  '9HR': TESTING_MODE ? 9 : 9,
  '10HR': TESTING_MODE ? 10 : 10,
  '11HR': TESTING_MODE ? 11 : 11,
  '14HR': TESTING_MODE ? 14 : 14,
};

// ============================================
// OPTIMIZATION FLAGS
// ============================================

// Skip monitoring during quiet hours (optional)
export const QUIET_HOURS_ENABLED = process.env.QUIET_HOURS_ENABLED === 'true' || false;
export const QUIET_HOURS_START = parseInt(process.env.QUIET_HOURS_START || '1'); // 1 AM
export const QUIET_HOURS_END = parseInt(process.env.QUIET_HOURS_END || '5'); // 5 AM
export const QUIET_HOURS_INTERVAL = 30 * 60 * 1000; // Check every 30 minutes during quiet hours

// Cache recent checks to avoid redundant processing
export const ENABLE_CACHE = process.env.ENABLE_MONITORING_CACHE === 'true' || true;
export const CACHE_TTL = 60 * 1000; // 60 seconds

// Database query optimization
export const BATCH_SIZE = parseInt(process.env.MONITORING_BATCH_SIZE || '100'); // Process max 100 shifts per cycle

// ============================================
// TIME CALCULATIONS
// ============================================

export const TIME_UNIT = TESTING_MODE ? 'minutes' : 'hours';
export const TIME_DIVISOR = TESTING_MODE 
  ? (1000 * 60)        // milliseconds to minutes
  : (1000 * 60 * 60);  // milliseconds to hours

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if current time is within quiet hours
 */
export const isQuietHours = () => {
  if (!QUIET_HOURS_ENABLED) return false;
  
  const now = new Date();
  const hour = now.getHours();
  
  if (QUIET_HOURS_START < QUIET_HOURS_END) {
    return hour >= QUIET_HOURS_START && hour < QUIET_HOURS_END;
  } else {
    // Handles overnight quiet hours (e.g., 22:00 to 05:00)
    return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
  }
};

/**
 * Get appropriate monitoring interval based on conditions
 */
export const getMonitoringInterval = (activeShiftsCount = 0, hasApproachingThreshold = false) => {
  if (!ADAPTIVE_MONITORING) {
    return MONITORING_INTERVAL;
  }

  // No active shifts - check less frequently
  if (activeShiftsCount === 0) {
    return IDLE_INTERVAL;
  }

  // Shifts approaching alert threshold - check more frequently
  if (hasApproachingThreshold) {
    return CRITICAL_INTERVAL;
  }

  // Quiet hours - check less frequently
  if (isQuietHours()) {
    return QUIET_HOURS_INTERVAL;
  }

  return MONITORING_INTERVAL;
};

/**
 * Check if a shift is approaching an alert threshold (within 15 minutes/seconds)
 */
export const isApproachingThreshold = (dutyTime) => {
  const buffer = TESTING_MODE ? 0.5 : 0.25; // 30 seconds in testing, 15 minutes in production
  
  for (const threshold of Object.values(ALERT_THRESHOLDS)) {
    const diff = threshold - dutyTime;
    if (diff > 0 && diff <= buffer) {
      return true;
    }
  }
  
  return false;
};

// ============================================
// COST ESTIMATION
// ============================================

export const getCostEstimation = () => {
  const checksPerHour = 3600000 / MONITORING_INTERVAL;
  const checksPerDay = checksPerHour * 24;
  const checksPerMonth = checksPerDay * 30;

  return {
    mode: TESTING_MODE ? 'TESTING' : 'PRODUCTION',
    interval: MONITORING_INTERVAL / 1000 + ' seconds',
    checksPerHour: Math.round(checksPerHour),
    checksPerDay: Math.round(checksPerDay),
    checksPerMonth: Math.round(checksPerMonth),
    estimatedDBQueries: Math.round(checksPerMonth),
    adaptiveMonitoring: ADAPTIVE_MONITORING,
    quietHours: QUIET_HOURS_ENABLED,
    cacheEnabled: ENABLE_CACHE,
  };
};

// ============================================
// CONFIGURATION DISPLAY
// ============================================

export const getDisplayConfig = () => ({
  mode: TESTING_MODE ? 'TESTING' : 'PRODUCTION',
  timeUnit: TIME_UNIT,
  monitoringInterval: TESTING_MODE 
    ? `${MONITORING_INTERVAL / 1000} seconds`
    : `${MONITORING_INTERVAL / 60000} minutes`,
  adaptiveMonitoring: ADAPTIVE_MONITORING ? 'ENABLED' : 'DISABLED',
  idleInterval: ADAPTIVE_MONITORING ? (TESTING_MODE 
    ? `${IDLE_INTERVAL / 1000} seconds (no active shifts)`
    : `${IDLE_INTERVAL / 60000} minutes (no active shifts)`) : 'N/A',
  criticalInterval: ADAPTIVE_MONITORING ? (TESTING_MODE
    ? `${CRITICAL_INTERVAL / 1000} seconds (approaching threshold)`
    : `${CRITICAL_INTERVAL / 60000} minutes (approaching threshold)`) : 'N/A',
  quietHours: QUIET_HOURS_ENABLED 
    ? `${QUIET_HOURS_START}:00 - ${QUIET_HOURS_END}:00 (checks every ${QUIET_HOURS_INTERVAL / 60000} min)`
    : 'DISABLED',
  caching: ENABLE_CACHE ? 'ENABLED' : 'DISABLED',
  batchSize: BATCH_SIZE,
  alertThresholds: Object.entries(ALERT_THRESHOLDS).map(([key, value]) => ({
    alert: key,
    threshold: `${value} ${TIME_UNIT}`,
  })),
});

export const logConfiguration = (logger) => {
  const config = getDisplayConfig();
  const cost = getCostEstimation();
  
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(`Alert System Configuration - ${config.mode} MODE`);
  logger.info('═══════════════════════════════════════════════════════');
  logger.info(` Monitoring Interval: ${config.monitoringInterval}`);
  logger.info(`Time Unit: ${config.timeUnit.toUpperCase()}`);
  
  if (ADAPTIVE_MONITORING) {
    logger.info('Adaptive Monitoring: ENABLED');
    logger.info(`   • Idle: ${config.idleInterval}`);
    logger.info(`   • Critical: ${config.criticalInterval}`);
  }
  
  if (QUIET_HOURS_ENABLED) {
    logger.info(`Quiet Hours: ${config.quietHours}`);
  }
  
  if (ENABLE_CACHE) {
    logger.info(`Caching: ENABLED (${CACHE_TTL / 1000}s TTL)`);
  }
  
  logger.info('Alert Thresholds:');
  config.alertThresholds.forEach(({ alert, threshold }) => {
    logger.info(`   • ${alert}: ${threshold}`);
  });
  
  logger.info('');
  logger.info('Cost Estimation:');
  logger.info(`   • Checks/hour: ${cost.checksPerHour}`);
  logger.info(`   • Checks/day: ${cost.checksPerDay}`);
  logger.info(`   • Checks/month: ${cost.checksPerMonth}`);
  logger.info(`   • DB queries/month: ~${cost.estimatedDBQueries}`);
  logger.info('═══════════════════════════════════════════════════════');
  
  if (TESTING_MODE) {
    logger.warn('  WARNING: System is running in TESTING MODE');
    logger.warn('Alerts will trigger in MINUTES instead of HOURS');
    logger.warn(' Set TESTING_MODE=false for production use');
  }
};

export default {
  TESTING_MODE,
  MONITORING_INTERVAL,
  ADAPTIVE_MONITORING,
  IDLE_INTERVAL,
  CRITICAL_INTERVAL,
  ALERT_THRESHOLDS,
  QUIET_HOURS_ENABLED,
  QUIET_HOURS_START,
  QUIET_HOURS_END,
  QUIET_HOURS_INTERVAL,
  ENABLE_CACHE,
  CACHE_TTL,
  BATCH_SIZE,
  TIME_UNIT,
  TIME_DIVISOR,
  isQuietHours,
  getMonitoringInterval,
  isApproachingThreshold,
  getCostEstimation,
  getDisplayConfig,
  logConfiguration,
};
