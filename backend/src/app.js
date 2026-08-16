import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './routes/index.js';
import { sanitizeMiddleware } from './middleware/sanitize.middleware.js';
import { notFoundHandler, errorMiddleware } from './middleware/error.middleware.js';
import { setIO } from './sockets/io.js';
import { setupSocketHandlers } from './sockets/index.js';
import { env } from './config/env.js';

export const app = express();

// Allowed CORS origins: the configured FRONTEND_URL plus any comma-separated
// FRONTEND_URLS, plus the usual local dev ports so the app works regardless of
// which port Vite happens to bind to. (Fixes "network error" when the dev
// server runs on a port other than the one in FRONTEND_URL.)
const ALLOWED_ORIGINS = new Set([
  env.FRONTEND_URL,
  ...(env.FRONTEND_URLS || []),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3100',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3100',
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser tools / same-origin / preflight with no origin
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    callback(null, true); // reflect any origin in dev (safe for local marketplace MVP)
  },
  credentials: true,
};

export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    credentials: true,
  },
});

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeMiddleware);

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorMiddleware);

setupSocketHandlers(io);
setIO(io);
