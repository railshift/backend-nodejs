import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Use /tmp for logs in production (required for Render)
// local logs directory otherwise
const logDir = process.env.NODE_ENV === 'production' 
  ? '/tmp' 
  : path.join(__dirname, '../../logs');

const transports = [];

// add console in production for Render logs
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
} else {
  // env =  development, add file transports
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports,
  exceptionHandlers: process.env.NODE_ENV === 'production' 
    ? [new winston.transports.Console()]
    : [new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })],
  rejectionHandlers: process.env.NODE_ENV === 'production'
    ? [new winston.transports.Console()]
    : [new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })],
});

// env =  development, log to console with colorized output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    })
  );
}

export default logger;
