import { z } from 'zod';
import crypto from 'crypto';
import { SupportPayment } from '../models/SupportPayment.js';
import { createNotification } from '../services/notification.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const checkoutSchema = z.object({
  amount: z.number().min(100).max(1000000),
  message: z.string().max(500).optional(),
});

const SAFEPAY_BASE_URL =
  env.SAFEPAY_ENV === 'production' ? 'https://api.safepay.pk' : 'https://sandbox.api.getamais.com';

export const createCoffeeSession = asyncHandler(async (req, res) => {
  const data = checkoutSchema.parse(req.body);
  const userId = req.user?._id ?? null;

  const payment = await SupportPayment.create({
  userId,
  amount: data.amount,
  currency: 'PKR',
  status: 'pending',
  message: data.message,
  });

  if (!env.SAFEPAY_API_KEY || !env.SAFEPAY_SECRET_KEY) {
  const reference = String(payment._id);
  const checkoutUrl = `${env.FRONTEND_URL}/support/success?reference=${reference}&dev=1`;
  return res.json(
  new ApiResponse('Dev checkout created', {
  checkoutUrl,
  dev: true,
  paymentId: payment._id,
  })
  );
  }

  try {
  const response = await fetch(`${SAFEPAY_BASE_URL}/api/v2/payments`, {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${env.SAFEPAY_API_KEY}`,
  },
  body: JSON.stringify({
  amount: data.amount * 100,
  currency: 'PKR',
  description: data.message || 'Support DreamEvents',
  reference: String(payment._id),
  success_url: `${env.FRONTEND_URL}/support/success?reference=${payment._id}`,
  cancel_url: `${env.FRONTEND_URL}/support`,
  webhook_url: `${env.FRONTEND_URL}/api/v1/support/webhook`,
  }),
  });

  const json = await response.json();
  const order = json.data?.order || json.order;

  if (!response.ok || !order) {
  throw new Error(JSON.stringify(json));
  }

  payment.safepayOrderId = order.id;
  await payment.save();

  res.json(
  new ApiResponse('Checkout created', {
  checkoutUrl: order.checkout_url || order.url,
  dev: false,
  paymentId: payment._id,
  })
  );
  } catch (error) {
  console.error('[support] Safepay checkout failed:', error.message);
  throw new ApiError(502, 'Payment provider unavailable — try again later');
  }
});

export const handleSafepayWebhook = asyncHandler(async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-safepay-signature'] || req.headers['safepay-signature'];

  if (env.SAFEPAY_WEBHOOK_SECRET) {
  const expected = crypto
  .createHmac('sha256', env.SAFEPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
  if (!signature || signature !== expected) {
  throw new ApiError(401, 'Invalid webhook signature');
  }
  }

  const event = req.body;
  const orderId = event.data?.order_id || event.order_id || event.order?.id;
  const status = event.event || event.type || event.data?.status;

  if (orderId) {
  const payment = await SupportPayment.findOne({ safepayOrderId: orderId });
  if (payment) {
  const completed =
  status === 'payment_successful' ||
  status === 'order_completed' ||
  status === 'completed' ||
  event.data?.status === 'COMPLETED';

  if (completed && payment.status !== 'completed') {
  payment.status = 'completed';
  await payment.save();

  if (payment.userId) {
  await createNotification({
  userId: payment.userId,
  type: 'system',
  title: 'Thank you for your support!',
  body: `Your support payment of ${payment.amount.toLocaleString('en-PK')} PKR was received.`,
  link: '/support',
  }).catch(() => {});
  }
  } else if (event.data?.status === 'FAILED' || event.data?.status === 'cancelled') {
  payment.status = 'failed';
  await payment.save();
  }
  }
  }

  res.status(200).json({ received: true });
});

export const listMySupportPayments = asyncHandler(async (req, res) => {
  const payments = await SupportPayment.find({ userId: req.user._id })
  .sort({ createdAt: -1 })
  .lean();

  res.json(new ApiResponse('Support payments fetched', payments));
});