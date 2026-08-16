import { z } from 'zod';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(['customer', 'seller']).default('customer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const publicUser = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  phone: user.phone ?? null,
  avatar: user.avatar ?? null,
  city: user.city ?? 'Sukkur',
  isEmailVerified: user.isEmailVerified,
  sellerProfileId: user.sellerProfileId ?? null,
  notificationPreferences: user.notificationPreferences,
  createdAt: user.createdAt,
});

const issueTokens = (user) => {
  const payload = { _id: user._id, role: user.role };
  return {
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
  };
};

export const signup = asyncHandler(async (req, res) => {
  const data = signupSchema.parse(req.body);

  const existing = await User.findOne({ email: data.email });
  if (existing) {
  throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
  name: data.name,
  email: data.email,
  password: data.password,
  phone: data.phone,
  city: data.city ?? 'Sukkur',
  role: data.role,
  isEmailVerified: false,
  });

  const { accessToken, refreshToken } = issueTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json(new ApiResponse('Account created', publicUser(user.toObject())));
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || user.isDeleted) {
  throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await user.comparePassword(data.password);
  if (!valid) {
  throw new ApiError(401, 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const { accessToken, refreshToken } = issueTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json(new ApiResponse('Logged in', publicUser(user.toObject())));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
  throw new ApiError(401, 'Refresh token missing');
  }

  let payload;
  try {
  payload = verifyRefreshToken(token);
  } catch {
  throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload._id);
  if (!user || user.isDeleted) {
  throw new ApiError(401, 'User no longer exists');
  }

  const { accessToken, refreshToken } = issueTokens(user);
  setAuthCookies(res, accessToken, refreshToken);

  res.json(new ApiResponse('Token refreshed', publicUser(user.toObject())));
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.json(new ApiResponse('Logged out', null));
});

export const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse('Authenticated', publicUser(req.user)));
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { access_token: accessToken } = req.body;
  if (!accessToken) {
  throw new ApiError(400, 'access_token is required');
  }

  let info;
  try {
  const response = await fetch(
  `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
  );
  if (!response.ok) {
  throw new Error('tokeninfo failed');
  }
  info = await response.json();
  } catch {
  throw new ApiError(401, 'Invalid Google access token');
  }

  if (!info.email_verified) {
  throw new ApiError(400, 'Google account email is not verified');
  }

  let user = await User.findOne({ googleId: info.sub });
  if (!user) {
  user = await User.findOne({ email: info.email });
  if (user) {
  throw new ApiError(409, 'An account with this email already exists. Log in with your password instead.');
  }
  user = await User.create({
  name: info.name || info.email.split('@')[0],
  email: info.email,
  googleId: info.sub,
  role: 'customer',
  city: 'Sukkur',
  isEmailVerified: true,
  password: undefined,
  });
  }

  if (user.isDeleted) {
  throw new ApiError(401, 'User no longer exists');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = issueTokens(user);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  res.json(new ApiResponse('Logged in with Google', publicUser(user.toObject())));
});