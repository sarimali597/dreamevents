import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 2000;

export const connectDB = async () => {
  if (env.DNS_SERVERS) {
    dns.setServers(env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
    console.log(`[db] Using custom DNS servers: ${env.DNS_SERVERS}`);
  }

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}):`, error?.message || error);
      if (attempt >= MAX_RETRIES) {
        console.error('[db] Giving up after maximum retries.');
        process.exit(1);
      }
      const delay = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
      console.log(`[db] Retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};
