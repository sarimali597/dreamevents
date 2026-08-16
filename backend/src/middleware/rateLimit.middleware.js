import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res, _next) => {
  res.status(429).set('Retry-After', '900').json({
  success: false,
  message: 'Too many requests — please try again later',
  data: null,
  });
  },
});