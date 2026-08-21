import { SupportPayment } from '../models/SupportPayment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// List support payments for the authenticated user
export const listMySupportPayments = asyncHandler(async (req, res) => {
  const payments = await SupportPayment.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  // Attach `reference` (a string alias for _id) so the success page can match
  // the ?reference= query param without relying on Mongoose virtuals in lean docs.
  const decorated = payments.map((p) => ({ ...p, reference: p._id?.toString() }));

  res.json(new ApiResponse('Support payments fetched', decorated));
});
