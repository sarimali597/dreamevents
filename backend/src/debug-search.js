import mongoose from 'mongoose';
import { env } from './config/env.js';
import { SellerProfile } from './models/SellerProfile.js';
import { Category } from './models/Category.js';

const main = async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log('[debug-search] Connected');

  const indexes = await SellerProfile.collection.indexes();
  console.log('[debug-search] SellerProfile indexes:');
  for (const idx of indexes) {
  console.log(
  ` - ${idx.name}: ${JSON.stringify(idx.key)}${idx.weights ? ` (weights=${JSON.stringify(idx.weights)})` : ''}`
  );
  }

  const approved = await SellerProfile.countDocuments({ status: 'approved', isDeleted: false });
  console.log(`[debug-search] Approved sellers: ${approved}`);

  const q = process.argv[2] || 'banquet';

  const textResults = await SellerProfile.find({
  $text: { $search: q },
  status: 'approved',
  isDeleted: false,
  })
  .limit(5)
  .lean();
  console.log(`[debug-search] $text search "${q}": ${textResults.length} result(s)`);
  for (const s of textResults) console.log(` - ${s.businessName} (${s.slug})`);

  const regexResults = await SellerProfile.find({
  businessName: { $regex: q, $options: 'i' },
  status: 'approved',
  })
  .limit(5)
  .lean();
  console.log(`[debug-search] regex fallback "${q}": ${regexResults.length} result(s)`);

  const categories = await Category.find().sort({ sortOrder: 1 }).lean();
  console.log(
  `[debug-search] Categories: ${categories.map((c) => `${c.slug}(${c.subcategories.length})`).join(', ')}`
  );

  await mongoose.disconnect();
  console.log('[debug-search] Done');
};

main().catch((error) => {
  console.error('[debug-search] Failed:', error);
  process.exit(1);
});