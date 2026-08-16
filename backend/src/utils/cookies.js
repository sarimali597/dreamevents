import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  domain: isProd && env.COOKIE_DOMAIN ? env.COOKIE_DOMAIN : undefined,
};

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, {
  ...baseOptions,
  maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
  ...baseOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { ...baseOptions });
  res.clearCookie('refreshToken', { ...baseOptions, path: '/api/v1/auth' });
}