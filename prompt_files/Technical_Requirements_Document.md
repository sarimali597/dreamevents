# DreamEvents — Technical Requirements Document (TRD)

**Version 1.0 — Express + MongoDB Backend / React (Vite) Frontend — Companion to the PRD**

---

## 1. Project Structure — Monorepo, Two Real Applications

```
dreamevents/  ← main folder (git root)
+-- frontend/  ← React 19 (Vite SPA) app, deployed to Netlify/Vercel
│  +-- src/
│  │  +-- main.jsx  ← React entry: mounts App + react-router
│  │  +-- App.jsx  ← Route definitions (react-router v7)
│  │  +-- routes/
│  │  │  +-- public/  ← Public routes group (no auth required)
│  │  │  │  +-- Home.jsx  ← Home
│  │  │  │  +-- Explore.jsx
│  │  │  │  +-- Venues.jsx
│  │  │  │  +-- Catering.jsx
│  │  │  │  +-- Photography.jsx
│  │  │  │  +-- Decoration.jsx
│  │  │  │  +-- SellerProfile.jsx
│  │  │  │  +-- Feed.jsx
│  │  │  │  +-- About.jsx
│  │  │  │  +-- Contact.jsx
│  │  │  │  +-- FAQ.jsx
│  │  │  +-- customer/  ← Customer routes (auth required)
│  │  │  │  +-- Dashboard.jsx
│  │  │  │  +-- Events.jsx
│  │  │  │  +-- Requests.jsx
│  │  │  │  +-- Estimates.jsx
│  │  │  │  +-- Favorites.jsx
│  │  │  │  +-- Messages.jsx
│  │  │  │  +-- Notifications.jsx
│  │  │  │  +-- Reviews.jsx
│  │  │  │  +-- Settings.jsx
│  │  │  +-- seller/  ← Seller routes (auth + seller role required)
│  │  │  │  +-- SellerDashboard.jsx
│  │  │  +-- admin/  ← Admin routes (auth + admin role required)
│  │  │  │  +-- Admin.jsx
│  │  │  +-- Layouts.jsx  ← PublicLayout, CustomerLayout, SellerLayout, AdminLayout
│  │  │  +-- Loading.jsx  ← Global loading fallback
│  │  │  +-- Error.jsx  ← Global error boundary
│  │  │  +-- NotFound.jsx  ← Custom 404
│  │  +-- components/
│  │  │  +-- ui/  ← shadcn/ui components
│  │  │  +-- layout/  ← Header, Footer, Sidebar, Shell
│  │  │  +-- search/  ← SearchBar, FilterPanel, ResultCard, MapView
│  │  │  +-- seller/  ← SellerProfile, Gallery, ServiceCard, ReviewCard
│  │  │  +-- booking/  ← RequestForm, EstimateCard, ChatThread, CalendarWidget
│  │  │  +-- dashboard/  ← StatCard, DataTable, RequestList, EventPlanner
│  │  │  +-- shared/  ← AnimatedSection, StarRating, VerifiedBadge, PriceDisplay
│  │  +-- hooks/  ← Custom React hooks
│  │  +-- lib/
│  │  │  +-- utils.js  ← cn() helper, formatters
│  │  │  +-- api.js  ← API client (axios instance with interceptors)
│  │  │  +-- socket.js  ← Socket.IO client setup
│  │  │  +-- auth.js  ← Auth helpers (getToken, isAuthenticated)
│  │  │  +-- constants.js  ← App constants
│  │  +-- styles/
│  │  │  +-- globals.css  ← Tailwind directives + CSS variables
│  │  +-- public/
│  │  +-- images/
│  │  +-- fonts/
│  +-- index.html  ← Vite entry HTML
│  +-- vite.config.js
│  +-- tailwind.config.js
│  +-- jsconfig.json
│  +-- package.json
+-- backend/  ← Express (JavaScript, ESM) + Mongoose app, deployed to Northflank
│  +-- src/
│  │  +-- config/
│  │  │  +-- database.js  ← MongoDB connection (Mongoose)
│  │  │  +-- env.js  ← env validation (zod)
│  │  │  +-- cloudinary.js  ← Cloudinary config
│  │  +-- models/  ← Mongoose models (one file per collection)
│  │  │  +-- User.js
│  │  │  +-- SellerProfile.js
│  │  │  +-- Service.js
│  │  │  +-- MenuCategory.js
│  │  │  +-- MenuItem.js
│  │  │  +-- Package.js
│  │  │  +-- BookingRequest.js
│  │  │  +-- Estimate.js
│  │  │  +-- Booking.js
│  │  │  +-- Availability.js
│  │  │  +-- Review.js
│  │  │  +-- Message.js
│  │  │  +-- Favorite.js
│  │  │  +-- FeedPost.js
│  │  │  +-- Notification.js
│  │  │  +-- City.js
│  │  │  +-- Category.js
│  │  │  +-- SupportPayment.js
│  │  +-- controllers/  ← Express controllers (one per domain)
│  │  │  +-- auth.controller.js
│  │  │  +-- user.controller.js
│  │  │  +-- seller.controller.js
│  │  │  +-- service.controller.js
│  │  │  +-- bookingRequest.controller.js
│  │  │  +-- estimate.controller.js
│  │  │  +-- booking.controller.js
│  │  │  +-- availability.controller.js
│  │  │  +-- review.controller.js
│  │  │  +-- message.controller.js
│  │  │  +-- favorite.controller.js
│  │  │  +-- feedPost.controller.js
│  │  │  +-- notification.controller.js
│  │  │  +-- search.controller.js
│  │  │  +-- admin.controller.js
│  │  │  +-- supportPayment.controller.js
│  │  +-- routes/  ← Express routers
│  │  │  +-- index.js  ← Main router aggregator
│  │  │  +-- auth.routes.js
│  │  │  +-- user.routes.js
│  │  │  +-- seller.routes.js
│  │  │  +-- service.routes.js
│  │  │  +-- bookingRequest.routes.js
│  │  │  +-- estimate.routes.js
│  │  │  +-- booking.routes.js
│  │  │  +-- availability.routes.js
│  │  │  +-- review.routes.js
│  │  │  +-- message.routes.js
│  │  │  +-- favorite.routes.js
│  │  │  +-- feedPost.routes.js
│  │  │  +-- notification.routes.js
│  │  │  +-- search.routes.js
│  │  │  +-- admin.routes.js
│  │  │  +-- supportPayment.routes.js
│  │  +-- middleware/
│  │  │  +-- auth.middleware.js  ← JWT verification
│  │  │  +-- role.middleware.js  ← Role-based access
│  │  │  +-- ownership.middleware.js ← Resource ownership checks
│  │  │  +-- error.middleware.js  ← Global error handler
│  │  │  +-- upload.middleware.js  ← Multer + Cloudinary upload
│  │  │  +-- rateLimit.middleware.js ← Express-rate-limit
│  │  +-- services/  ← Business logic layer
│  │  +-- utils/
│  │  │  +-- ApiError.js  ← Custom error class
│  │  │  +-- ApiResponse.js  ← Standard response wrapper
│  │  │  +-- asyncHandler.js  ← Promise wrapper for async route handlers
│  │  │  +-- jwt.js  ← JWT sign/verify helpers
│  │  │  +-- email.js  ← Resend email wrapper
│  │  │  +-- scheduler.js  ← node-cron jobs
│  │  +-- sockets/
│  │  │  +-- index.js  ← Socket.IO server setup + event handlers
│  │  +-- app.js  ← Express app factory (no listen)
│  +-- server.js  ← Entry point: connects DB, starts HTTP + Socket.IO server
│  +-- Dockerfile  ← Multi-stage Node build for Northflank
│  +-- .env.example
│  +-- package.json
+-- package.json  ← Root: workspace scripts
+-- pnpm-workspace.yaml  ← pnpm workspaces definition
+-- turbo.json  ← Turborepo pipeline config (optional)
+-- .env.example
+-- README.md
```

`frontend/` and `backend/` are genuinely separate applications — separate `package.json`, separate deploy target, separate runtime. The frontend never touches the database; the backend has no UI at all.

**Why this stack, not NestJS/Prisma/Postgres:** The builder (Sarim) explicitly prefers Express + MongoDB + Mongoose for the backend. This is a deliberate, acceptable trade: Mongoose schemas are simpler for an AI agent to generate correctly than Prisma, MongoDB Atlas has a generous free tier (512MB M0 cluster), and Express is the most widely understood Node framework. The frontend is a plain React SPA (built with Vite) — no SSR framework, no TypeScript — because the builder wants the simplest possible JavaScript stack end to end. SEO-critical public pages are covered with a prerender-friendly SPA (meta tags, Open Graph via a small `og` route in the backend, sitemap.xml served by the backend).

---

## 2. Stack Decision Summary

| Layer | Choice | Why |
|---|---|---|
| **Frontend framework** | **React 19 + Vite SPA** (react-router, JavaScript only) | Builder's explicit preference: no SSR framework, no TypeScript anywhere; one simple JS codebase; calls the backend API. |
| Styling | Tailwind CSS v4 | Utility-first, built-in dark mode, minimal CSS bundle. |
| Component base | shadcn/ui + Magic UI + Aceternity UI | Code ownership, Radix primitives for accessibility, Magic UI for animated landing sections. |
| Scroll & motion | GSAP + ScrollTrigger + Lenis, Motion (motion.dev) | GSAP for macro scroll-driven storytelling, Motion for micro transitions, Lenis for smooth scroll. |
| Maps | MapLibre GL JS via react-map-gl, MapTiler tiles | Open source, free tier (100K map loads/mo), no Google Maps billing surprises. |
| Frontend data fetching | **TanStack Query** + plain fetch/axios client | Client state managed by React Query; no server-rendering layer to coordinate with. |
| Frontend realtime client | **socket.io-client** | Connects to the backend's Socket.IO server. |
| Forms & validation | React Hook Form + Zod | Same schema validates frontend before sending to backend. |
| **Backend framework** | **Express 5** + JavaScript | Builder's explicit preference; simpler than NestJS for AI-generated code; mature ecosystem. |
| **Database** | **MongoDB Atlas** (M0 free tier, 512MB) via **Mongoose 8** | Builder's explicit preference; free tier sufficient for MVP. |
| **ODM** | **Mongoose 8** | Schema validation, middleware, query building, population. |
| **Realtime** | **Socket.IO** (backend) + **socket.io-client** (frontend) | Native support in Express; rooms map to booking-request threads; full auth control. |
| **Scheduled jobs** | **node-cron** inside the backend | Runs inside same Node process; no external cron service needed. |
| Auth | **Custom JWT** (jsonwebtoken) + bcryptjs | Simpler than Supabase Auth for this stack; httpOnly cookie-based sessions. |
| Search | **MongoDB Atlas Search** (M0 limited indexes) | Included in M0; reduces infra complexity for V1; upgrade to Typesense in Phase 2 if needed. |
| Media | **Cloudinary** | Free tier 25 credits/mo; image transforms, optimization, CDN delivery. |
| Payments | **Safepay** | "Buy Us a Coffee" only; webhook lands on backend. |
| Email | **Resend** | Developer-friendly, React JSX templates, 3k free emails/mo. |
| Package manager | **pnpm**, with workspaces | Needed for the monorepo. |
| Hosting | **Netlify/Vercel** (frontend) + **Northflank** (backend) + **MongoDB Atlas** (database) | See Section 8 for free-tier specifics. |

---

## 3. What Changed From the NestJS/Prisma Approach, and Why

- **Express, adopted (instead of NestJS):** The builder explicitly prefers Express. It's simpler, has less boilerplate, and is easier for an AI coding agent to generate correctly.
- **MongoDB + Mongoose, adopted (instead of PostgreSQL + Prisma):** The builder's explicit preference. MongoDB Atlas M0 free tier (512MB) is sufficient for MVP. Mongoose provides schema validation, pre/post hooks, and population.
- **Custom JWT Auth, adopted (instead of Supabase Auth):** With Express backend, custom JWT is simpler than integrating Supabase Auth Admin SDK. We use bcryptjs for password hashing, jsonwebtoken for JWT operations, and httpOnly cookies for session management.
- **MongoDB Atlas Search, adopted (instead of Typesense/Meilisearch):** Reduces infrastructure complexity for V1. Atlas Search is included in M0 (with limited indexes). If search becomes a bottleneck in Phase 2, migrate to Typesense self-hosted on Northflank's second free service slot.
- **What did not change:** shadcn/ui over Mantine/Ant Design, MapLibre over Mapbox, GSAP/Lenis/Motion for animation, Cloudinary for media, Tailwind for styling, Socket.IO for realtime, dark/light mode support, mobile-first responsive design.

---

## 4. Backend Architecture (Express)

### 4.1 Application bootstrap

```ts
// backend/src/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { setupSocketHandlers } from './sockets';

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/v1', routes);
app.use(errorMiddleware);

setupSocketHandlers(io);
```

### 4.2 Middleware stack

| Middleware | Purpose | Applied globally? |
|---|---|---|
| `helmet` | Security headers | Yes |
| `cors` | Restrict to FRONTEND_URL only, credentials true | Yes |
| `express.json` | Parse JSON bodies, 10MB limit | Yes |
| `cookieParser` | Parse httpOnly cookies | Yes |
| `morgan` | Request logging (dev format) | Yes |
| `authMiddleware` | Verify JWT access token | Protected routes only |
| `roleMiddleware` | Check user.role against required roles | Role-specific routes only |
| `ownershipMiddleware` | Check resource ownership | Ownership-sensitive routes only |
| `rateLimit` | Express-rate-limit on public mutation endpoints | POST/PUT/DELETE endpoints |
| `uploadMiddleware` | Multer + Cloudinary upload | File upload endpoints |

### 4.3 Auth flow (JWT + httpOnly cookies)

1. **Signup:** `POST /api/v1/auth/signup` -> bcrypt hash password -> create User -> generate accessToken + refreshToken -> set both as httpOnly cookies.
2. **Login:** `POST /api/v1/auth/login` -> verify password -> generate tokens -> set cookies.
3. **Protected routes:** `authMiddleware` reads `accessToken` from cookies -> verifies with JWT_SECRET -> attaches `req.user` -> continues.
4. **Refresh:** `POST /api/v1/auth/refresh` -> reads `refreshToken` from cookies -> verifies -> generates new accessToken -> sets new cookie.
5. **Logout:** `POST /api/v1/auth/logout` -> clears both cookies.
6. **Role checks:** After `authMiddleware`, `roleMiddleware(['seller'])` checks `req.user.role`.
7. **Ownership checks:** For seller-specific resources, `ownershipMiddleware` verifies `req.user.sellerProfileId === resource.sellerId`.

### 4.4 Socket.IO architecture

```ts
// backend/src/sockets/index.js
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export function setupSocketHandlers(io: Server) {
  io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  socket.data.user = decoded;
  next();
  } catch {
  next(new Error('Authentication error'));
  }
  });

  io.on('connection', (socket) => {
  socket.on('join-room', (bookingRequestId: string) => {
  socket.join(`booking:${bookingRequestId}`);
  });

  socket.on('leave-room', (bookingRequestId: string) => {
  socket.leave(`booking:${bookingRequestId}`);
  });

  socket.on('typing', ({ bookingRequestId, isTyping }) => {
  socket.to(`booking:${bookingRequestId}`).emit('typing', {
  userId: socket.data.user._id, isTyping
  });
  });
  });
}
```

Controllers emit events via `io.to("booking:" + bookingRequestId).emit("message:new", message)` after database writes.

### 4.5 Scheduled jobs (node-cron)

```ts
// backend/src/utils/scheduler.js
import cron from 'node-cron';
import { BookingRequest } from '../models/BookingRequest';
import { Availability } from '../models/Availability';

// Hourly: expire stale booking requests (seller hasn't responded in 48h)
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  await BookingRequest.updateMany(
  { status: 'pending', createdAt: { $lt: cutoff } },
  { status: 'expired' }
  );
});

// Hourly: release Holds where seller hasn't confirmed deposit in 48h
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const expired = await BookingRequest.find({
  status: 'accepted',
  acceptedAt: { $lt: cutoff },
  depositConfirmed: false
  });
  for (const req of expired) {
  req.status = 'expired';
  await req.save();
  await Availability.updateOne(
  { sellerId: req.sellerId, date: req.eventDate },
  { status: 'available', bookingRequestId: null }
  );
  }
});

// Daily at 1am: mark bookings as completed once event date has passed
cron.schedule('0 1 * * *', async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Booking.updateMany(
  { status: 'confirmed', eventDate: { $lt: today } },
  { status: 'completed' }
  );
});
```

---

## 5. Data Layer (MongoDB + Mongoose)

### 5.1 Connection

```ts
// backend/src/config/database.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
  const conn = await mongoose.connect(process.env.MONGODB_URI!, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
  console.error('MongoDB connection error:', error);
  process.exit(1);
  }
};
```

Use MongoDB Atlas connection string with retry writes enabled. The M0 free tier allows 500 max connections and 100 ops/sec — sufficient for MVP but monitor with Atlas dashboards.

### 5.2 Schema design principles

- **One collection per entity** (Users, SellerProfiles, Services, etc.) — no embedded subdocuments for data that grows unbounded (messages, reviews, availability).
- **Reference pattern** for relationships: `sellerId: ObjectId` with Mongoose `ref: 'SellerProfile'` and `.populate()` where needed.
- **Compound indexes** on query-heavy fields (e.g., `{ sellerId: 1, date: 1 }` on Availability).
- **Text indexes** on searchable fields (businessName, description) for Atlas Search / text search fallback.
- **Schema validation** via Mongoose built-in validators + pre-save hooks.

### 5.3 Atlas Search (V1 search strategy)

Instead of running a separate search engine, use MongoDB Atlas Search:

```json
{
  "mappings": {
  "dynamic": false,
  "fields": {
  "businessName": { "type": "string", "analyzer": "standard" },
  "description": { "type": "string", "analyzer": "standard" },
  "category": { "type": "string", "facet": true },
  "subcategories": { "type": "string", "facet": true },
  "city": { "type": "string", "facet": true },
  "area": { "type": "string" },
  "startingPrice": { "type": "number" },
  "rating": { "type": "number" },
  "verificationStatus": { "type": "string", "facet": true }
  }
  }
}
```

The `search.controller.js` uses `$search` aggregation stage. If Atlas Search limits are hit on M0, the fallback is regex text search on indexed fields.

---

## 6. Search Architecture

### 6.1 Atlas Search query pattern

```ts
// backend/src/controllers/search.controller.js
import { SellerProfile } from '../models/SellerProfile';

export const searchSellers = async (req, res) => {
  const { q, category, city, minPrice, maxPrice, rating, sortBy = 'relevance' } = req.query;

  const pipeline: any[] = [];

  if (q) {
  pipeline.push({
  $search: {
  index: 'seller_search',
  text: { query: q, path: ['businessName', 'description'], fuzzy: { maxEdits: 1 } }
  }
  });
  }

  const matchStage: any = { status: 'approved', verificationStatus: 'verified' };
  if (category) matchStage.category = category;
  if (city) matchStage.city = city;
  if (minPrice || maxPrice) {
  matchStage.startingPrice = {};
  if (minPrice) matchStage.startingPrice.$gte = Number(minPrice);
  if (maxPrice) matchStage.startingPrice.$lte = Number(maxPrice);
  }
  if (rating) matchStage.rating = { $gte: Number(rating) };

  pipeline.push({ $match: matchStage });

  if (sortBy === 'rating') pipeline.push({ $sort: { rating: -1 } });
  else if (sortBy === 'price_low') pipeline.push({ $sort: { startingPrice: 1 } });
  else if (sortBy === 'price_high') pipeline.push({ $sort: { startingPrice: -1 } });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  const results = await SellerProfile.aggregate(pipeline);
  res.json(results);
};
```

### 6.2 Geo search (MapLibre + MapTiler)

Store `latitude` and `longitude` on SellerProfile. Use MongoDB `$geoWithin` or simple distance calculation for "near me" queries. MapLibre displays pins; the backend returns seller data including coordinates.

---

## 7. Auth Flow (concretely)

1. Frontend calls `POST /api/v1/auth/signup` (or `/login`, `/otp/verify`, Google OAuth callback) on the backend.
2. `auth.controller.js` validates input with Zod -> bcrypt hash password -> create User via Mongoose.
3. Backend generates JWT access token (15 min expiry) and refresh token (7 day expiry).
4. Backend sets these as **httpOnly, Secure, SameSite=strict cookies**.
5. Every subsequent frontend request automatically carries the cookie; `authMiddleware` verifies the JWT.
6. Refresh: `POST /api/v1/auth/refresh` -> reads `refreshToken` from cookies -> verifies -> generates new accessToken.
7. Google OAuth: Use `passport-google-oauth20` or implement manually with Google's tokeninfo endpoint. On successful OAuth, create/find User and issue JWT cookies.
8. Phone OTP: Use Twilio or a local Pakistani SMS provider for OTP delivery. Store OTP in MongoDB with 5-minute TTL. Verify and issue JWT.

---

## 8. Deployment Architecture

| Service | Hosts | Notes |
|---|---|---|
| **Netlify/Vercel** | `frontend/` (React (Vite)) | `dreamevents.com`. Hobby plan: 100GB bandwidth, 1M edge requests, 100 build minutes. Non-commercial only for free tier. |
| **Northflank** | `backend/` (Express) | `api.dreamevents.com`. Developer Sandbox: **2 always-on services, 2 jobs, 1 addon**. No cold starts. |
| **MongoDB Atlas** | Database (M0) | 512MB storage, 500 max connections, 100 ops/sec. One free cluster per project. |
| **Cloudinary** | Media | Free tier: 25 credits/mo. |
| **Safepay** | "Buy Us a Coffee" | Webhook endpoint on backend. |
| **MapTiler** | Map tiles | Free tier: 100K map loads/mo. |
| **Resend** | Email | Free tier: 3,000 emails/mo. |
| Domain | — | ~$8-12/yr from Cloudflare Registrar, Porkbun, or Namecheap. |

### 8.1 Why Northflank over Render for backend

Northflank's Developer Sandbox free tier includes **2 always-on services with no cold starts/spin-down**. Render's free tier spins down after 15 minutes of inactivity and takes ~30 seconds to wake up — unacceptable for a realtime chat/notification system.

### 8.2 Northflank free tier specifics

- **2 free services** (always-on, no sleep): backend (1 service) + optional future service = fits perfectly.
- **2 free cron jobs**: our scheduled jobs run in-process via node-cron, so these slots go unused.
- **1 free database addon**: could host Redis cache here if needed later.
- **Custom domains**: Supported on free tier. Point `api.dreamevents.com` to the backend service.
- **Build from Dockerfile**: Standard multi-stage Node build.
- **Health checks**: Configure HTTP health check against `/api/v1/health` for auto-restart.

### 8.3 CI/CD

- **Frontend:** Netlify/Vercel Git integration — auto-deploy on push to `main`.
- **Backend:** Northflank Git integration — auto-build and deploy on push to `main`.
- Both pipelines should run `pnpm type-check` and `pnpm lint` before deploy.

### 8.4 Free-tier-first cost strategy

| Service | Free tier covers | Upgrade trigger |
|---|---|---|
| Netlify/Vercel Hobby | Frontend hosting, 100GB bandwidth | Commercial launch or 100GB exceeded |
| Northflank Sandbox | Backend hosting (1 service), always-on | Need >2 services or production SLA |
| MongoDB Atlas M0 | 512MB DB, 500 connections | DB size approaching 400MB |
| Cloudinary Free | 25 credits/month | Image traffic exceeding ~20GB/mo |
| MapTiler Free | 100K map loads/month | High Explore-page traffic |
| Resend Free | 3,000 emails/month | Notification volume exceeding 3k/mo |
| Safepay | No fixed cost | Scales with tip volume |
| Domain | N/A | ~$8-12/yr, the one guaranteed cost |

---

## 9. Environment Variables

```bash
# frontend/.env.local
VITE_SITE_URL=https://dreamevents.com
VITE_API_URL=https://api.dreamevents.com
VITE_MAPTILER_API_KEY=
VITE_CLOUDINARY_CLOUD_NAME=

# backend/.env
PORT=4000
NODE_ENV=development
FRONTEND_URL=https://dreamevents.com
COOKIE_DOMAIN=.dreamevents.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dreamevents?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Safepay
SAFEPAY_API_KEY=
SAFEPAY_SECRET_KEY=
SAFEPAY_WEBHOOK_SECRET=
SAFEPAY_ENV=sandbox

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM_ADDRESS=noreply@dreamevents.com
EMAIL_FROM_NAME=DreamEvents

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Nothing secret should ever be prefixed with `VITE_` in the frontend.

---

## 10. Feature-Specific Technical Requirements

### 10.1 Estimate math

```ts
// backend/src/utils/estimate.js
interface EstimateLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export function calculateEstimateTotal(
  items: EstimateLineItem[],
  discount: number = 0,
  serviceCharge: number = 0,
  tax: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const afterDiscount = subtotal - discountAmount;
  const serviceChargeAmount = (afterDiscount * serviceCharge) / 100;
  const taxAmount = (afterDiscount * tax) / 100;
  const total = afterDiscount + serviceChargeAmount + taxAmount;
  return { subtotal, discount: discountAmount, serviceCharge: serviceChargeAmount, tax: taxAmount, total };
}
```

### 10.2 Image galleries

- Cloudinary upload: backend generates signed upload params.
- Frontend uses Cloudinary image URLs with `f_auto/q_auto` transforms.
- Gallery uses `yet-another-react-lightbox` for lightbox.
- Aspect ratios: cover images 16:9, gallery thumbnails 4:3 or 1:1.

### 10.3 Map behavior

- MapLibre GL JS via `react-map-gl`.
- Custom muted base map style from MapTiler.
- Brand-colored pins: `primary-600` for standard, `accent-500` for featured.
- Clustering at zoom levels < 12.
- "Search this area" button after map drag.

### 10.4 "Buy Us a Coffee" Safepay integration

```ts
// backend/src/controllers/supportPayment.controller.js
export const createCoffeeSession = async (req, res) => {
  const { amount, message } = req.body;
  const session = await createCheckoutSession({
  amount: amount * 100,
  currency: 'PKR',
  description: 'Support DreamEvents',
  metadata: { message, userId: req.user?._id }
  });
  res.json({ url: session.redirect_url });
};

export const handleSafepayWebhook = async (req, res) => {
  const isValid = verifyWebhook(req.body, req.headers['x-safepay-signature']);
  if (!isValid) return res.status(400).send('Invalid signature');
  await SupportPayment.create({
  amount: req.body.amount / 100,
  currency: 'PKR',
  status: 'completed',
  metadata: req.body.metadata
  });
  res.status(200).send('OK');
};
```

### 10.5 OG image generation

Stays in `frontend/` using React (Vite) `ImageResponse` (`@vercel/og`). Fetches seller data from backend's public API endpoint.

### 10.6 Sitemap generation

React (Vite) `app/sitemap.js`. Fetches approved sellers, categories, cities from backend. Regenerates daily.

---

## 11. Money Flow

### 11.1 Ledger-based booking confirmation

`booking.controller.js`'s `confirmDeposit()` is the single function that confirms a booking:

```ts
export const confirmDeposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
  const bookingRequest = await BookingRequest.findById(req.params.id).session(session);
  if (!bookingRequest || bookingRequest.sellerId.toString() !== req.user.sellerProfileId) {
  throw new ApiError(403, 'Unauthorized');
  }

  await LedgerEntry.create([{
  bookingRequestId: bookingRequest._id,
  type: 'deposit_received',
  amount: bookingRequest.depositAmount,
  method: req.body.method,
  reference: req.body.reference,
  recordedBy: req.user._id
  }], { session });

  await Booking.create([{
  bookingRequestId: bookingRequest._id,
  userId: bookingRequest.userId,
  sellerId: bookingRequest.sellerId,
  eventDate: bookingRequest.eventDate,
  status: 'confirmed',
  depositConfirmed: true
  }], { session });

  await Availability.updateOne(
  { sellerId: bookingRequest.sellerId, date: bookingRequest.eventDate },
  { status: 'booked', bookingRequestId: bookingRequest._id },
  { session }
  );

  await session.commitTransaction();
  res.json({ success: true });
  } catch (error) {
  await session.abortTransaction();
  throw error;
  } finally {
  session.endSession();
  }
};
```

The MongoDB transaction preserves the guarantee: a booking is never left "confirmed" while the calendar still shows the date open.

### 11.2 "Buy Us a Coffee"

The only Safepay integration in the system, deliberately decoupled from everything above:

- `POST /api/v1/support-payments/checkout` creates a Safepay session.
- `POST /api/v1/support-payments/webhook` verifies Safepay's signature and writes exactly one `SupportPayment` document.
- No other table, service, or state machine reacts to this webhook.

---

## 12. Notifications

- **In-app:** `notification.controller.js` exposes `createNotification(userId, type, title, body, link)`, called from other controllers at relevant transition points. Each call persists a `Notification` document and emits a `notification:new` event through Socket.IO.
- **Email:** a thin wrapper around Resend, called from the same trigger points but only for higher-value events (new booking request, estimate received, booking confirmed).
- **Push:** out of scope for V1.

---

## 13. SEO & Performance

- **Metadata:** React (Vite) Metadata API; dynamic OG images per seller profile; JSON-LD (`LocalBusiness`/`Service` + `AggregateRating`) on seller profiles, `BreadcrumbList` on category/city pages.
- **Sitemap:** generated in `frontend/`, sourced from backend's public seller/category/city endpoints.
- **Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1 on 4G mobile.
- **Performance strategies:** code-split route-level lazy loading (React.lazy + Suspense), Cloudinary `f_auto/q_auto` transforms for correctly-sized images, font-display swap for Geist/Fraunces.
- **Custom 404:** `app/not-found.jsx` — on-brand, includes live search bar and links to popular categories.
- **robots.txt:** allows full crawl of public routes; disallows customer/seller/admin route groups.

---

## 14. Security Requirements

- CORS on the backend restricted to `FRONTEND_URL` only, `credentials: true`.
- All secrets live in `backend/.env` only — structural guarantee (frontend build has no access).
- Webhook signature verification (Safepay) in `supportPayment.controller.js`.
- Rate limiting via `express-rate-limit` on public mutation endpoints: 100 requests per 15 minutes per IP.
- File upload validation (type/size) server-side in `upload.middleware.js`.
- Password hashing: bcryptjs with cost factor 12.
- JWT secrets: minimum 32 characters, rotated in production.
- Helmet.js for security headers (HSTS, XSS filter, content-type nosniff, etc.).
- Input sanitization: express-mongo-sanitize to prevent NoSQL injection.

---

## 15. Assumptions & Risks

| Assumption | Risk | Mitigation |
|---|---|---|
| MongoDB Atlas M0 (512MB) sufficient for MVP | Storage limit hit with many images | Store images in Cloudinary, only URLs in MongoDB |
| Netlify/Vercel Hobby non-commercial clause | Project paused if flagged as commercial | Upgrade to Pro ($20/mo) before public monetization |
| Northflank free tier stays at 2 services | Policy change | Backend is single service; room for one more |
| Atlas Search performs well on M0 | Index/query limits | Fallback to regex text search; upgrade to M10 if needed |
| Custom JWT auth is secure enough | Token theft, XSS | httpOnly cookies, short expiry, refresh rotation, Helmet |
