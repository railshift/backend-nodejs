import promClient from 'prom-client';
// Currently Not in use ; for later expansion 

// Registry
const register = new promClient.Registry();

// default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeShifts = new promClient.Gauge({
  name: 'active_shifts_total',
  help: 'Total number of active shifts',
});

export const dutyHoursGauge = new promClient.Gauge({
  name: 'duty_hours_current',
  help: 'Current duty hours for active shifts',
  labelNames: ['shift_id', 'staff_id'],
});

export const notificationsSent = new promClient.Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['type'],
});

export const databaseQueries = new promClient.Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation'],
});

export const redisOperations = new promClient.Counter({
  name: 'redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation'],
});

export const socketConnections = new promClient.Gauge({
  name: 'socket_connections_active',
  help: 'Number of active socket connections',
});


register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeShifts);
register.registerMetric(dutyHoursGauge);
register.registerMetric(notificationsSent);
register.registerMetric(databaseQueries);
register.registerMetric(redisOperations);
register.registerMetric(socketConnections);

export { register };
