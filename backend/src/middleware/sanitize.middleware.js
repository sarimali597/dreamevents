import { sanitize } from 'express-mongo-sanitize';

const isObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasNoDollarKeys = (obj) =>
  Object.keys(obj).every(
  (key) => !key.startsWith('$') && !key.includes('.')
  );

export const sanitizeMiddleware = (_req, _res, next) => {
  const req = _req;

  if (isObject(req.body)) {
  if (!hasNoDollarKeys(req.body)) {
  req.body = sanitize(req.body);
  }
  }
  if (isObject(req.params)) {
  sanitize(req.params);
  }

  const query = req.query;
  if (query && isObject(query)) {
  sanitize(query);
  }

  next();
};