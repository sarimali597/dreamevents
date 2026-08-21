import { categorySeeds } from './categories.js';
import { Category } from '../models/Category.js';

export const seedCategories = async () => {
  let created = 0;
  let skipped = 0;

  for (const cat of categorySeeds) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      console.log(`[seed] Category "${cat.slug}" already exists, skipping`);
      skipped++;
      continue;
    }

    await Category.create(cat);
    console.log(`[seed] Created category: ${cat.name}`);
    created++;
  }

  console.log(`[seed] Categories: ${created} created, ${skipped} skipped`);
  return { created, skipped };
};
