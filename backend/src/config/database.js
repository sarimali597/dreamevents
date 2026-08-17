import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 2000;

// Private/reserved ranges that cannot resolve public DNS — ignore them if
// someone mistakenly sets DNS_SERVERS to a LAN gateway (e.g. 192.168.100.1).
const PRIVATE_PREFIXES = ['10.', '127.', '172.16.', '172.17.', '172.18.', '172.19.', '172.2', '172.30.', '172.31.', '192.168.', '169.254.'];

function applyDnsServers(raw) {
  if (!raw) return;
  const servers = raw.split(',').map((s) => s.trim()).filter(Boolean);
  const publicServers = servers.filter((s) => !PRIVATE_PREFIXES.some((p) => s.startsWith(p)));
  const skipped = servers.length - publicServers.length;
  if (skipped > 0) {
    console.warn(`[db] Ignoring ${skipped} private DNS server(s) from DNS_SERVERS (cannot resolve public hosts).`);
  }
  if (publicServers.length) {
    dns.setServers(publicServers);
    console.log(`[db] Using custom DNS servers: ${publicServers.join(', ')}`);
  }
}

export const connectDB = async () => {
  applyDnsServers(env.DNS_SERVERS);

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
