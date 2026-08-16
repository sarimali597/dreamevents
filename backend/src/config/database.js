import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

export const connectDB = async () => {
  try {
  if (env.DNS_SERVERS) {
  dns.setServers(env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
  console.log(`[db] Using custom DNS servers: ${env.DNS_SERVERS}`);
  }
  const conn = await mongoose.connect(env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
  }
};