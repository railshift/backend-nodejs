import '../config/firebase.js'
import { getMessaging } from 'firebase-admin/messaging';
import prisma from '../config/database.js';

export const sendNotificationToDevices =
  async ({
    deviceTokens,
    title,
    body,
    data = {},
  }) => {
    for (const device of deviceTokens) {
      try {

        await sendPushNotification({
          token: device.token,
          title,
          body,
          data,
        });

      } catch (error) {

        if (
          error.code ===
            'messaging/registration-token-not-registered'
          ||
          error.code ===
            'messaging/invalid-registration-token'
        ) {

          await prisma.deviceToken.delete({
            where: {
              id: device.id,
            },
          });

        }

      }
    }
  };

export const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {

  try {
    const response = await getMessaging().send({
      token,
      notification: {
        title,
        body,
      },
      data,
    });
    return response;

  } catch (error) {
    console.error('FCM Error:', error);
    throw error;
  }
};


const registerDeviceTokenService = async (
  userId,
  token,
  platform = 'ANDROID'
) => {

  await prisma.deviceToken.deleteMany({
    where: {
      userId,
      platform,
      token: {
        not: token,
      },
    },
  });

  return await prisma.deviceToken.upsert({
    where: {
      token,
    },

    update: {
      userId,
      platform,
    },

    create: {
      userId,
      token,
      platform,
    },
  });

};

export { registerDeviceTokenService };