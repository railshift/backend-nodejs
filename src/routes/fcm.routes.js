import express from 'express';
import { registerDeviceToken, testNotification } from '../controllers/fcm.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/register-token',
  authenticate,
  registerDeviceToken
);

router.post(
  '/test',
  testNotification
);

export default router;