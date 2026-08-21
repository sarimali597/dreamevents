import { runSeed } from '../seed/runner.js';
import { Category } from '../models/Category.js';
import { SellerProfile } from '../models/SellerProfile.js';

export async function runSeedIfNeeded() {
  const catCount = await Category.countDocuments();
  const sellerCount = await SellerProfile.countDocuments();

  if (catCount >= 4 && sellerCount >= 7) {
    console.log(`[seed] DB already seeded (${catCount} categories, ${sellerCount} sellers) — skipping`);
    return;
  }

  if (catCount === 0 && sellerCount === 0) {
    console.log('[seed] DB is empty — running full seed...');
  } else {
    console.log(`[seed] Partial seed detected (${catCount} categories, ${sellerCount} sellers) — re-running seed to fill gaps...`);
  }

  const result = await runSeed();
  console.log(`[seed] Done: ${result.categories} categories, ${result.cities} cities, ${result.sellers} sellers`);
}
