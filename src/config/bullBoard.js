import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

import { shiftAlertQueue } from '../queues/shiftAlertQueue.js';

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(shiftAlertQueue)
  ],
  serverAdapter,
});

export { serverAdapter };