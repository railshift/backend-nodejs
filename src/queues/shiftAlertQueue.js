import { Queue } from "bullmq";
import { bullmqConnection } from "../config/bullmq.js";

const shiftAlertQueue = new Queue(
  'shift-alerts',
  {
    connection: bullmqConnection,
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  }
); 
export { shiftAlertQueue };