import { httpServer } from './src/app.js';
import { connectDB } from './src/config/database.js';
import { env } from './src/config/env.js';
import { startScheduler } from './src/utils/scheduler.js';

const bootstrap = async () => {
  await connectDB();
  startScheduler();

  httpServer.listen(env.PORT, () => {
  console.log(`[api] DreamEvents backend listening on http://localhost:${env.PORT}`);
  console.log(`[api] Frontend origin: ${env.FRONTEND_URL}`);
  });
};

bootstrap().catch((error) => {
  console.error('[api] Failed to bootstrap:', error);
  process.exit(1);
});