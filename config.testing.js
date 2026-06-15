export const TESTING_MODE = process.env.TESTING_MODE === 'true';

// Monitoring interval
export const MONITORING_INTERVAL = TESTING_MODE 
  ? 60 * 1000  // 60 s in testing mode
  : 15 * 60 * 1000; // 15 min in production

export const ALERT_THRESHOLDS = {
  '7HR': 7,
  '8HR': 8,
  '9HR': 9,
  '10HR': 10,
  '11HR': 11,
  '14HR': 14,
};

export const TIME_UNIT = TESTING_MODE ? 'minutes' : 'hours';
export const TIME_DIVISOR = TESTING_MODE 
  ? 60 * 1000  // mili --> s, hr
  : 60 * 60 * 1000; 

// Log configuration on startup (on server start up first time)
export const logConfiguration = (logger) => {
  if (TESTING_MODE) {
    logger.warn('  TESTING MODE ');
    logger.warn('   Using MINUTES instead of HOURS for alerts');
    logger.warn('   7 minutes = 7HR alert, 8 minutes = 8HR alert, etc.');
    logger.warn(`   Monitoring interval: ${MONITORING_INTERVAL / 1000} seconds`);
  }
};

export default {
  TESTING_MODE,
  MONITORING_INTERVAL,
  ALERT_THRESHOLDS,
  TIME_UNIT,
  TIME_DIVISOR,
  logConfiguration,
};
