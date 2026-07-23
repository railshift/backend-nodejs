import { initializeApp, cert, getApps } from 'firebase-admin/app';
import fs from 'fs';

const serviceAccount = JSON.parse(
  fs.readFileSync(
    './dutyhours-node-firebase-adminsdk-fbsvc-6ae4fff253.json',
    'utf8'
  )
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });

  console.log(' Firebase initialized');
}