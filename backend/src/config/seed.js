import { runSeed } from '../seed/runner.js';
import { Category } from '../models/Category.js';
import { SellerProfile } from '../models/SellerProfile.js';

export async function runSeedIfNeeded() {
  const [catCount, sellerCount] = await Promise.all([
    Category.countDocuments(),
    SellerProfile.countDocuments(),
  ]);

  if (catCount > 0 && sellerCount > 0) {
    console.log(`[seed] DB already has ${catCount} categories, ${sellerCount} sellers — skipping`);
    return;
  }

  console.log('[seed] DB is empty — running seed...');
  const result = await runSeed();
  console.log(`[seed] Done: ${result.categories} categories, ${result.cities} cities, ${result.sellers} sellers`);
}
