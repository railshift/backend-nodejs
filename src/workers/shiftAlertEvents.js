import { QueueEvents } from 'bullmq';
import { bullmqConnection } from '../config/bullmq';

const queueEvents = new QueueEvents(
  'shift-alerts',
  {
    connection: bullmqConnection,
  }
);

queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(
    `Job ${jobId} failed`,
    failedReason
  );
});