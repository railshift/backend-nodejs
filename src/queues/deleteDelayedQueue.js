import { shiftAlertQueue } from "./shiftAlertQueue.js";

const delayedJobs = await shiftAlertQueue.getDelayed();

for (const job of delayedJobs) {
  await job.remove();
}

console.log(`Deleted ${delayedJobs.length} delayed jobs`);