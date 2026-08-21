import { citySeeds } from './cities.js';
import { City } from '../models/City.js';

export const seedCities = async () => {
  let created = 0;
  let skipped = 0;

  for (const city of citySeeds) {
    const existing = await City.findOne({ slug: city.slug });
    if (existing) {
      console.log(`[seed] City "${city.slug}" already exists, skipping`);
      skipped++;
      continue;
    }

    await City.create(city);
    console.log(`[seed] Created city: ${city.name}`);
    created++;
  }

  console.log(`[seed] Cities: ${created} created, ${skipped} skipped`);
  return { created, skipped };
};
