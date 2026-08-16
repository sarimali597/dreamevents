import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const seedAdmin = async () => {
  const email = env.ADMIN_EMAIL || 'admin@dreamevents.com';
  const existing = await User.findOne({ email });
  if (existing) {
  console.log(`[seed] Admin already exists: ${email}`);
  return existing;
  }

  let password = env.ADMIN_PASSWORD;
  if (!password) {
  password = 'Admin' + Math.random().toString(36).slice(2, 10);
  console.log(`[seed] ADMIN_PASSWORD was empty — generated: ${password}`);
  }

  const admin = await User.create({
  name: 'DreamEvents Admin',
  email,
  password,
  role: 'admin',
  city: 'Sukkur',
  isEmailVerified: true,
  });

  console.log(`[seed] Admin created: ${email}`);
  return admin;
};