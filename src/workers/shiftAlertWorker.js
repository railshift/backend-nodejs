import { Worker } from 'bullmq';
import { bullmqConnection } from '../config/bullmq.js';
import prisma from '../config/database.js';
import { sendNotificationToDevices } from '../services/fcmService.js';


console.log(' Shift Alert Worker Started');
console.log('shiftAlertWorker.js loaded');

export const shiftAlertWorker = new Worker(
  'shift-alerts',
  async (job) => {
    const { shiftId, thresholdHours } = job.data;
    console.log(
  `Shift ${shiftId} crossed ${thresholdHours} hours`
    );

    // fetching the shift
    const shift = await prisma.shift.findUnique({
         where: {
            id: shiftId,
             },
            include: {
              locoPilot: true,
              trainManager: true,
             },
                });

                if (!shift) {
                console.log('Shift not found');
                return;
            }
    // Prevent false alerts if the shift has already ended
    if (shift.status !== 'IN_PROGRESS') {
        console.log(
    `Shift ${shift.id} already completed`
        );
        return;
        }
    
    // creating database record for the alert
    const notification = await prisma.notification.create({
        data: 
            { 
            shiftId: shift.id,
            type: `DUTY_${thresholdHours}HR`,
            title: `Duty Hour Alert - ${thresholdHours} Hours`,
            message: `Shift for ${shift.trainName} has crossed ${thresholdHours} hours of duty.`,
             },
    });

    // Socket Event Emit (TODO: configure socket emitter in worker)
    // io.emit('shift:duty-alert', {
    //     shiftId: shift.id,
    //     trainNumber: shift.trainNumber,
    //     thresholdHours: thresholdHours,
    //     locoPilot: shift.locoPilot.name,
    //     trainManager: shift.trainManager.name,
    // });
            //   socket.on(
//              'shift:duty-alert',
//                 (data) => {
//                  console.log(data);
//                  }
//                  );



    // send FCM
const users = await prisma.user.findMany({
      where: {
      role: {
        in: [
          'USER',
          'ADMIN',
        ],
      },
    },

    include: {
      deviceTokens: true,
    },
  });

  const deviceTokens =
  await prisma.deviceToken.findMany({
    include: {
      user: true,
    },
  });

  await sendNotificationToDevices({
  deviceTokens,
  title: notification.title,
  body: notification.message,
  data: {
    shiftId: String(shiftId),
    notificationId: String(notification.id),
    type: String(notification.type),
  },
});


  },
  {
    connection: bullmqConnection,
    concurrency: 10,
  }
);


export default shiftAlertWorker;