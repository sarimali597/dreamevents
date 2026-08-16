import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { Category } from '../models/Category.js';
import { City } from '../models/City.js';
import { categorySeeds } from './categories.js';
import { citySeeds } from './cities.js';
import { seedAdmin } from './admin.js';
import { seedDemoSellers } from './demoData.js';

const args = process.argv.slice(2);
const should = (flag) => args.includes(flag) || args.includes('--all') || args.length === 0;

const seedCategories = async () => {
  if (args.includes('--reset')) await Category.deleteMany({});
  for (const c of categorySeeds) {
  await Category.updateOne({ slug: c.slug }, { $set: c }, { upsert: true });
  }
  console.log(`[seed] Categories: ${categorySeeds.length} upserted`);
};

const seedCities = async () => {
  if (args.includes('--reset')) await City.deleteMany({});
  for (const c of citySeeds) {
  const data = {
  ...c,
  areas: c.areas.map((area) => ({
  name: area,
  slug: area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  })),
  };
  await City.updateOne({ slug: c.slug }, { $set: data }, { upsert: true });
  }
  console.log(`[seed] Cities: ${citySeeds.length} upserted`);
};

const run = async () => {
  console.log('[seed] Connecting to MongoDB...');
  await connectDB();
  console.log('[seed] Connected.');

  try {
  if (should('--categories')) await seedCategories();
  if (should('--cities')) await seedCities();
  if (should('--admin')) await seedAdmin();
  if (should('--demo')) await seedDemoSellers();

  console.log('[seed] Done.');
  } catch (error) {
  console.error('[seed] Failed:', error);
  process.exitCode = 1;
  } finally {
  await mongoose.disconnect();
  }
};

run();