import { asyncHandler } from '../middleware/errorHandler.js';
import {registerDeviceTokenService, sendPushNotification} from '../services/fcmService.js';
import prisma from '../config/database.js';

export const registerDeviceToken = asyncHandler(
  async (req, res) => {

    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await registerDeviceTokenService(
      userId,
      token
    );

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
    });
  }
);

export const testNotification = async (req, res) => {

  const tokenRecord = await prisma.deviceToken.findFirst();

  if (!tokenRecord) {
    return res.status(404).json({
      success: false,
      message: 'No device token found',
    });
  }

  const response =
    await sendPushNotification({
      token: tokenRecord.token,
      title: 'Duty Hours Test',
      body: 'FCM is working ',
    });

  res.json({
    success: true,
    response,
  });
};