// TODO: #rana8257 = Prometheus metrics middleware for API monitoring
import {
  httpRequestDuration,
  httpRequestTotal,
} from '../config/metrics.js';
import logger from '../utils/logger.js';

// Prometheus metrics middleware
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // Intercept response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route ? req.route.path : req.path;

    // Record metrics
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();

    // Log request
    logger.info(
      `${req.method} ${route} ${res.statusCode} - ${duration.toFixed(3)}s`
    );
  });

  next();
};
