/**
 * ALERT CONFIGURATION (Production)
 * 
 * Phase 1: Monitoring/alerts disabled by default
 * Alert system will be activated in Phase 2
 */

export const TESTING_MODE = false; // Always production

// Monitoring interval: 5 minutes
export const MONITORING_INTERVAL = 5 * 60 * 1000; // milliseconds

// Alert thresholds in hours
export const ALERT_THRESHOLDS = {
  '7HR': 7,
  '8HR': 8,
  '9HR': 9,
  '10HR': 10,
  '11HR': 11,
  '14HR': 14,
};

// Production time settings
export const TIME_UNIT = 'hours';
export const TIME_DIVISOR = 60 * 60 * 1000; // milliseconds to hours

// Log configuration on startup (disabled - no verbose logging)
export const logConfiguration = (logger) => {
  // Silent - no configuration logging needed
};

export default {
  TESTING_MODE,
  MONITORING_INTERVAL,
  ALERT_THRESHOLDS,
  TIME_UNIT,
  TIME_DIVISOR,
  logConfiguration,
};
