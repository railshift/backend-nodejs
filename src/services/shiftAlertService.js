import {shiftAlertQueue} from "../queues/shiftAlertQueue.js"

export const scheduleShiftAlerts = async (shift) => {

  const signOnTime = new Date(shift.signOnDateTime);

  const alertHours = [8, 10, 12];

  const jobs = {};

  for (const hours of alertHours) {

    const alertTime =
      signOnTime.getTime() +
      hours * 60 * 60 * 1000;

    const delay =
      alertTime - Date.now();

    if (delay <= 0) continue;

    const job = await shiftAlertQueue.add(
      `shift-${hours}-hour-alert`,
      {
        shiftId: shift.id,
        thresholdHours: hours,
      },
      {
        delay : 10000, // 10 sec for testing
      }
    );

    jobs[`${hours}Hour`] = job.id;
  }

  return jobs;
};