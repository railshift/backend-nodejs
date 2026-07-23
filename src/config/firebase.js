import { initializeApp, cert, getApps } from 'firebase-admin/app';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    serviceAccount = JSON.parse(
      fs.readFileSync(
        './dutyhours-node-firebase-adminsdk-fbsvc-6ae4fff253.json',
        'utf8'
      )
    );
  }
} catch (error) {
  console.warn('Firebase credentials not found or invalid in env/file. Firebase will not be initialized.');
}

if (serviceAccount && !getApps().length) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase initialized successfully');  } catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
  }
}