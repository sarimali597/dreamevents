# DreamEvents — Implementation Plan

**Version 1.0 · The executable runbook for building DreamEvents V1 · Companion to PRD, TRD, App Flow, UI/UX Brief, and Backend Schema**

---

## How to Read This Document

This is the **sixth and final handoff document**. It takes everything defined in the PRD (what), TRD (how technically), App Flow (user paths), UI/UX Brief (visual language), and Backend Schema (data layer) and converts it into an **ordered, dependency-respecting build sequence** that an AI coding agent can execute file-by-file.

**Companion references (read these first — this plan assumes you have):**
- `01-Product-Requirements-Document.md` — Scope, features, business rules
- `02-Technical-Requirements-Document.md` — Stack, project structure, deployment
- `03-App-Flow-Document.md` — Screen map, state machines, flow logic
- `04-UIUX-Design-Brief.md` — Design tokens, typography, motion, component direction
- `05-Backend-Schema-Document.md` — 22 collections with full Mongoose schemas

**What this document gives you:**
1. **8 build phases** from empty repo to deployed product
2. **File-by-file creation order** within each phase — never build a file before its dependencies exist
3. **Checkpoint definitions** — what "done" looks like at each phase boundary
4. **API endpoint inventory** — every route, method, and purpose
5. **Component inventory** — every major UI component and its data dependencies
6. **Testing strategy** — what to test and when
7. **Deployment runbook** — exact steps to go live on Netlify/Vercel + Northflank + Atlas

**What this document does NOT do:**
- Repeat schema definitions (see Backend Schema Document)
- Repeat design token values (see UI/UX Design Brief)
- Repeat business rules (see PRD and App Flow)
- It *references* them at every decision point.

---

## 1. Executive Summary

DreamEvents V1 is a **full-stack marketplace application** with:
- **Frontend:** React 19 (Vite, JavaScript, Tailwind, shadcn/ui) — deployed to Netlify/Vercel
- **Backend:** Express 5 + JavaScript + MongoDB/Mongoose — deployed to Northflank
- **Realtime:** Socket.IO for chat/negotiation threads
- **Media:** Cloudinary for image upload + transformation
- **Payments:** Safepay for "Buy Us a Coffee" only
- **Email:** Resend for transactional notifications
- **Maps:** MapLibre GL JS + MapTiler for explore view

**Build philosophy for AI agents:**
- **Backend-first, then frontend.** The frontend needs real API endpoints to be useful. Build the backend API surface completely before touching customer-facing pages.
- **Vertical slices, not horizontal layers.** Within each phase, complete one feature's backend + frontend together rather than building all models, then all controllers, then all pages. This gives you testable, working software at every checkpoint.
- **Seed data is infrastructure.** Every phase that creates collections must also create seed data so the next phase has something to render.
- **Auth is the spine.** Authentication and role-based access control must work before any protected route or dashboard screen is built.

**Estimated build timeline (AI agent at full throughput):**
| Phase | Name | Duration | Cumulative |
|---|---|---|---|
| 0 | Project Bootstrap & Tooling | 1 day | Day 1 |
| 1 | Backend Foundation — Identity & Catalog | 3 days | Day 4 |
| 2 | Backend Core — Booking Engine | 4 days | Day 8 |
| 3 | Frontend Foundation & Design System | 2 days | Day 10 |
| 4 | Public Discovery Pages | 3 days | Day 13 |
| 5 | Customer Account & Booking Flow | 3 days | Day 16 |
| 6 | Seller Dashboard | 4 days | Day 20 |
| 7 | Admin Panel | 2 days | Day 22 |
| 8 | Platform Features, Payments & Polish | 3 days | Day 25 |
| — | Testing, Bugfix, Deploy | 2 days | Day 27 |

**Total: ~4 weeks of continuous AI agent execution.**

---

## 2. Architecture Overview

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  React 19 (Vite)  │  │  Socket.IO  │  │  MapLibre GL  │  │
│  │  (Netlify/Vercel)  │  │  Client  │  │  (MapTiler)  │  │
│  │  │  │  │  │  │  │
│  │  • react-router  │  │  • Chat rooms  │  │  • Explore map  │  │
│  │  • Server Comp  │  │  • Typing ind.  │  │  • Seller pins  │  │
│  │  • TanStack Q  │  │  • Notif. push  │  │  • Clusters  │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────┘  │
│  │  │  │
│  │ HTTPS / API  │ WebSocket  │
│  ▼  ▼  │
├─────────────────────────────────────────────────────────────────────────────┤
│  API LAYER (Northflank)  │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  Express 5 Server  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │  Auth  │ │ Sellers │ │Booking  │ │Messages │ │  Admin  │  │  │
│  │  │Routes  │ │Routes  │ │Routes  │ │(Socket) │ │  Routes  │  │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘  │  │
│  │  └─────────────┴───────────┴───────────┴─────────────┘  │  │
│  │  │  │  │
│  │  ┌─────────┴─────────┐  │  │
│  │  ▼  ▼  │  │
│  │  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │  Mongoose  │  │  node-cron Jobs │  │  │
│  │  │  ODM Layer  │  │  • Expire holds │  │  │
│  │  └──────┬──────┘  │  • Complete old │  │  │
│  │  │  │  bookings  │  │  │
│  │  ▼  └─────────────────┘  │  │
│  │  ┌──────────────┐  │  │
│  │  │ MongoDB Atlas│  │  │
│  │  │  (M0)  │  │  │
│  │  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│  │  │  │  │
│  ▼  ▼  ▼  │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Cloudinary │  │  Resend  │  │  Safepay  │  │
│  │  (Images)  │  │  (Email)  │  │  (Tips only)  │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Summary

| Flow | Direction | Key Collections | Realtime? |
|---|---|---|---|
| Search/Explore | Frontend → Backend → Atlas Search | `sellerProfiles`, `categories`, `cities` | No |
| Booking Request | Frontend → Backend → MongoDB | `bookingRequests`, `availability` | Yes (notification) |
| Estimate/Negotiation | Frontend ↔ Backend ↔ MongoDB | `estimates`, `messages` | Yes (Socket.IO room) |
| Deposit Confirmation | Seller dashboard → Backend (transaction) | `bookings`, `availability`, `ledgerEntries` | Yes (notification) |
| Chat Messages | Frontend ↔ Socket.IO ↔ MongoDB | `messages` | Yes (Socket.IO room) |
| Calendar Updates | Seller dashboard → Backend → MongoDB | `availability` | No |
| Reviews | Frontend → Backend → MongoDB | `reviews` → updates `sellerProfiles` | No |
| Admin Actions | Admin panel → Backend → MongoDB | `sellerProfiles`, `reports`, `adminActivityLogs` | No |

### 2.3 Critical Path

The **critical path** is the sequence of tasks where any delay delays the entire project:

```
Project Setup → MongoDB Connection → User Auth → SellerProfile Model 
→ BookingRequest Model → Estimate Model → Availability Model 
→ Booking Model + confirmDeposit transaction → Message Model + Socket.IO 
→ Frontend Auth → Explore Page → Seller Profile Page 
→ Booking Request Form → Customer Dashboard → Seller Dashboard 
→ Admin Panel → Deploy
```

Everything else (favorites, feed posts, analytics, "Buy Us a Coffee") branches off this path and can be built in parallel once its parent node is complete.

---

## 3. Phase 0: Project Bootstrap & Tooling

**Goal:** A working monorepo with both applications running locally, connected to MongoDB, with hot reload, JavaScript, linting, and the design system initialized.

**Duration:** 1 day

**Prerequisites:** Node.js 20+, pnpm, MongoDB Atlas cluster created, Cloudinary account, Resend account, MapTiler account, Safepay sandbox account.

### 3.1 Repository Structure

Create the exact structure defined in TRD Section 1:

```
dreamevents/
├── frontend/  ← React 19 (Vite SPA) (react-router)
├── backend/  ← Express 5 + Mongoose
├── package.json  ← Root workspace config
├── pnpm-workspace.yaml
└── turbo.json
```

### 3.2 File Build Order — Phase 0

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 0.1 | `package.json` (root) | Workspace definition, shared scripts | TRD §1 |
| 0.2 | `pnpm-workspace.yaml` | pnpm workspace globs | TRD §1 |
| 0.3 | `turbo.json` | Build pipeline caching (optional) | TRD §1 |
| 0.4 | `backend/package.json` | Express, Mongoose, JavaScript deps | TRD §2 |
| 0.5 | `backend/jsconfig.json` | Strict JavaScript, path aliases | TRD §1 |
| 0.6 | `backend/.env.example` | All backend env vars listed | TRD §9 |
| 0.7 | `backend/src/config/env.js` | Zod env validation | TRD §4.1 |
| 0.8 | `backend/src/config/database.js` | MongoDB connection with retry | TRD §5.1, Backend Schema §5 |
| 0.9 | `backend/src/utils/ApiError.js` | Custom error class | TRD §1 |
| 0.10 | `backend/src/utils/ApiResponse.js` | Standard response wrapper | TRD §1 |
| 0.11 | `backend/src/utils/asyncHandler.js` | Promise wrapper for routes | TRD §1 |
| 0.12 | `backend/src/middleware/error.middleware.js` | Global error handler | TRD §4.2 |
| 0.13 | `backend/src/app.js` | Express app factory (no listen) | TRD §4.1 |
| 0.14 | `backend/server.js` | Entry point: DB connect + HTTP + Socket.IO | TRD §4.1 |
| 0.15 | `backend/Dockerfile` | Multi-stage Node build | TRD §8 |
| 0.16 | `frontend/package.json` | React 19 (Vite), Tailwind, shadcn/ui deps | TRD §2 |
| 0.17 | `frontend/jsconfig.json` | React (Vite) JavaScript config | TRD §1 |
| 0.18 | `frontend/vite.config.js` | Output config, image domains | TRD §1 |
| 0.19 | `frontend/tailwind.config.js` | Design tokens integration | UI/UX Brief §2 |
| 0.20 | `frontend/src/styles/globals.css` | Tailwind directives + CSS variables | UI/UX Brief §2 |
| 0.21 | `frontend/src/lib/utils.js` | `cn()` helper, formatters | TRD §1 |
| 0.22 | `frontend/index.html` | Vite entry HTML | TRD §1 |
| 0.23 | `frontend/src/main.jsx` | React entry: mounts App + router | TRD §1 |
| 0.24 | `frontend/src/App.jsx` | Route definitions + providers | TRD §1, UI/UX Brief §3 |
| 0.25 | `frontend/src/routes/Home.jsx` | Placeholder home page | — |
| 0.26 | `frontend/src/routes/NotFound.jsx` | Custom 404 page | UI/UX Brief §10, TRD §13 |

### 3.3 Key Decisions in This Phase

1. **Design token injection:** The Tailwind config must read the exact brand colors from UI/UX Brief Section 2 and generate the full scale. Do not hardcode arbitrary hex values — use the anchor colors (`#306998`, `#FFD43B`, `#1A1A2E`) and generate the ramp programmatically or via a tool like uicolors.app, then paste the resulting scale into `tailwind.config.js`.

2. **Font loading:** Self-host Fraunces and Geist Sans `.woff2` in `frontend/public/fonts/` via CSS `@font-face` with `font-display: swap` (UI/UX Brief §3.3). Do not use runtime Google Fonts `<link>` tags — they cause layout shift.

3. **MongoDB connection:** The `database.js` config must include `maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000`, and retry logic. Test the connection with a simple health endpoint before proceeding.

4. **Environment validation:** Use Zod to validate all env vars at startup. If `MONGODB_URI` or `JWT_SECRET` is missing, the backend must refuse to start with a clear error message.

### 3.4 Phase 0 Checkpoint

- [ ] `pnpm install` succeeds in both `frontend/` and `backend/`
- [ ] `pnpm dev` starts both apps simultaneously (React (Vite) on :3000, Express on :4000)
- [ ] Backend health endpoint `GET /api/v1/health` returns `{ status: "ok", db: "connected" }`
- [ ] Frontend renders the placeholder home page with correct fonts and brand colors
- [ ] Dark mode toggle works (system preference + manual toggle)
- [ ] Both apps boot with zero errors

---

## 4. Phase 1: Backend Foundation — Identity & Catalog

**Goal:** All authentication, user management, seller profiles, categories, cities, services, menus, packages, and gallery infrastructure is built, seeded, and testable via API.

**Duration:** 3 days

**Why this phase is first:** Every other feature depends on `users` and `sellerProfiles`. You cannot build a booking request without users, or a seller storefront without seller profiles.

### 4.1 File Build Order — Phase 1

**Day 1: Auth & Core Identity**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 1.1 | `backend/src/models/User.js` | User schema with bcrypt, JWT methods | Backend Schema §3.1 |
| 1.2 | `backend/src/utils/jwt.js` | JWT sign/verify helpers | TRD §4.3 |
| 1.3 | `backend/src/middleware/auth.middleware.js` | JWT verification middleware | TRD §4.3 |
| 1.4 | `backend/src/middleware/role.middleware.js` | Role-based access control | TRD §4.3, PRD §5 |
| 1.5 | `backend/src/controllers/auth.controller.js` | Signup, login, refresh, logout | TRD §4.3, §7 |
| 1.6 | `backend/src/routes/auth.routes.js` | Auth route definitions | TRD §1 |
| 1.7 | `backend/src/models/Category.js` | Category master table | Backend Schema §4.1 |
| 1.8 | `backend/src/models/City.js` | City master table | Backend Schema §4.2 |
| 1.9 | `backend/src/seeds/categories.seed.js` | V1 category seed data | Backend Schema §12 |
| 1.10 | `backend/src/seeds/cities.seed.js` | Sukkur + areas seed data | Backend Schema §12 |
| 1.11 | `backend/src/seeds/admin.seed.js` | First admin user from env | Backend Schema §12 |
| 1.12 | `backend/src/seeds/index.js` | Master seed runner | Backend Schema §12 |

**Day 2: Seller Profile & Catalog Models**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 1.13 | `backend/src/models/SellerProfile.js` | Seller storefront schema | Backend Schema §4.3 |
| 1.14 | `backend/src/models/Service.js` | Individual services | Backend Schema §4.4 |
| 1.15 | `backend/src/models/MenuCategory.js` | Catering menu headers | Backend Schema §4.5 |
| 1.16 | `backend/src/models/MenuItem.js` | Catering menu items | Backend Schema §4.5 |
| 1.17 | `backend/src/models/Package.js` | Bundled offerings | Backend Schema §4.6 |
| 1.18 | `backend/src/models/GalleryImage.js` | Seller gallery photos | Backend Schema §4.7 |
| 1.19 | `backend/src/config/cloudinary.js` | Cloudinary SDK config | TRD §1 |
| 1.20 | `backend/src/middleware/upload.middleware.js` | Multer + Cloudinary upload | TRD §4.2, §14 |
| 1.21 | `backend/src/controllers/seller.controller.js` | Seller CRUD, approval flow | PRD §6.9, App Flow §6 |
| 1.22 | `backend/src/routes/seller.routes.js` | Seller routes | TRD §1 |
| 1.23 | `backend/src/controllers/service.controller.js` | Service/menu/package CRUD | PRD §6.1, §6.9 |
| 1.24 | `backend/src/routes/service.routes.js` | Service routes | TRD §1 |

**Day 3: Search & Public API Surface**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 1.25 | `backend/src/controllers/search.controller.js` | Atlas Search + fallback | TRD §6, Backend Schema §9 |
| 1.26 | `backend/src/routes/search.routes.js` | Search routes | TRD §1 |
| 1.27 | `backend/src/controllers/user.controller.js` | User profile CRUD | PRD §6.2 |
| 1.28 | `backend/src/routes/user.routes.js` | User routes | TRD §1 |
| 1.29 | `backend/src/seeds/sellers.seed.js` | 8-12 demo sellers | Backend Schema §12.3 |
| 1.30 | `backend/src/seeds/services.seed.js` | Demo services per seller | Backend Schema §12.3 |
| 1.31 | `backend/src/seeds/galleryImages.seed.js` | Demo gallery images | Backend Schema §12.3 |
| 1.32 | `backend/src/routes/index.js` | Main router aggregator | TRD §1 |

### 4.2 Critical Implementation Notes

**1. User Schema (1.1):**
- Follow Backend Schema §3.1 exactly. The `password` field must have `select: false`.
- The `comparePassword` instance method must use `bcrypt.compare`.
- Pre-save hook must hash password with cost factor 12 only when modified.

**2. SellerProfile Schema (1.13):**
- This is the most complex schema in V1. Follow Backend Schema §4.3 exactly.
- The `slug` auto-generation pre-validate hook must handle collisions (e.g., append `-2`, `-3`).
- The state machine pre-save hook for `status` transitions must match App Flow §5.5 exactly.
- `verificationDocuments` must point to Cloudinary's **private folder** (PRD §10, Backend Schema §11.2).
- Text search index + geo index must both be created.

**3. Auth Middleware (1.3):**
- Read JWT from `httpOnly` cookie, not `Authorization` header.
- Attach full `req.user` object including `sellerProfileId` if role is seller.
- On verification failure, return 401 with clear message — do not redirect.

**4. Upload Middleware (1.20):**
- Use Multer memory storage (not disk) for serverless compatibility.
- Route verification documents to `private/verification/{sellerId}/` in Cloudinary.
- Route gallery images to `public/sellers/{sellerId}/gallery/`.
- Validate file type (image only) and size (max 5MB) before upload.

**5. Search Controller (1.25):**
- Implement Atlas Search `$search` aggregation first.
- Implement regex text fallback for when Atlas Search is unavailable (M0 limits).
- The fallback must use the `seller_text_search` text index defined in Backend Schema §4.3.
- Always filter by `{ status: 'approved', verificationStatus: 'verified', isDeleted: false }` for public results.

**6. Seed Data (1.29-1.31):**
- Create 8-12 realistic Pakistani sellers across all 4 categories in Sukkur.
- Use real business names (e.g., "Al-Noor Marriage Hall", "Sukkur Catering Services").
- Use Cloudinary remote URLs or local placeholder images for demo data.
- The admin account must be pre-created so the first deployment has an admin ready.
- All seed scripts must be idempotent (`findOneAndUpdate` with `upsert: true`).

### 4.3 Phase 1 API Surface

| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | `/api/v1/auth/signup` | No | — | Register (customer or seller) |
| POST | `/api/v1/auth/login` | No | — | Login, set cookies |
| POST | `/api/v1/auth/refresh` | No | — | Refresh access token |
| POST | `/api/v1/auth/logout` | Yes | — | Clear cookies |
| GET | `/api/v1/auth/me` | Yes | — | Current user |
| GET | `/api/v1/search` | No | — | Search sellers (Atlas Search) |
| GET | `/api/v1/sellers` | No | — | List approved sellers |
| GET | `/api/v1/sellers/:slug` | No | — | Public seller profile |
| POST | `/api/v1/sellers` | Yes | seller | Create seller profile (onboarding) |
| PUT | `/api/v1/sellers/:id` | Yes | seller | Update own profile |
| GET | `/api/v1/sellers/:id/services` | No | — | List seller services |
| POST | `/api/v1/services` | Yes | seller | Create service |
| PUT | `/api/v1/services/:id` | Yes | seller | Update service |
| DELETE | `/api/v1/services/:id` | Yes | seller | Delete (soft) service |
| GET | `/api/v1/categories` | No | — | List categories |
| GET | `/api/v1/cities` | No | — | List cities + areas |
| GET | `/api/v1/users/me` | Yes | — | Get own profile |
| PUT | `/api/v1/users/me` | Yes | — | Update own profile |

### 4.4 Phase 1 Checkpoint

- [ ] Signup creates a User with hashed password
- [ ] Login sets httpOnly cookies and returns user object
- [ ] `auth.middleware` rejects requests without valid cookies
- [ ] `role.middleware` rejects sellers accessing customer routes and vice versa
- [ ] `GET /api/v1/search?q=wedding&category=venues` returns filtered sellers
- [ ] `GET /api/v1/sellers/al-noor-marriage-hall` returns full profile with services
- [ ] Seed script populates 8-12 sellers with services and gallery images
- [ ] Cloudinary upload works for both public gallery and private verification docs
- [ ] All new endpoints return consistent `ApiResponse` format

---

## 5. Phase 2: Backend Core — Booking Engine

**Goal:** The entire booking negotiation flow works end-to-end: request → estimate → negotiation → acceptance → hold → deposit confirmation → booking. Plus messages, notifications, reviews, favorites, feed posts, and availability management.

**Duration:** 4 days

**Why this phase is critical:** This is the product's core differentiator. Everything in Phase 1 was infrastructure; this is the business logic that makes DreamEvents a marketplace instead of a directory.

### 5.1 File Build Order — Phase 2

**Day 1: Booking Request & Availability**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 2.1 | `backend/src/models/Event.js` | Customer event plans | Backend Schema §5.1 |
| 2.2 | `backend/src/models/BookingRequest.js` | Core negotiation header | Backend Schema §5.2 |
| 2.3 | `backend/src/models/Availability.js` | Per-seller per-date calendar | Backend Schema §5.5 |
| 2.4 | `backend/src/controllers/bookingRequest.controller.js` | Create, read, update requests | App Flow §2, §3, §5.1 |
| 2.5 | `backend/src/controllers/availability.controller.js` | Calendar CRUD | App Flow §5.4, PRD §6.4 |
| 2.6 | `backend/src/routes/bookingRequest.routes.js` | Request routes | TRD §1 |
| 2.7 | `backend/src/routes/availability.routes.js` | Availability routes | TRD §1 |

**Day 2: Estimates & Bookings**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 2.8 | `backend/src/models/Estimate.js` | Structured price quotes | Backend Schema §5.3 |
| 2.9 | `backend/src/models/Booking.js` | Confirmed reservations | Backend Schema §5.4 |
| 2.10 | `backend/src/models/LedgerEntry.js` | Shared payment records | Backend Schema §5.6 |
| 2.11 | `backend/src/controllers/estimate.controller.js` | Estimate builder + versioning | App Flow §3, §5.2, PRD §6.3 |
| 2.12 | `backend/src/controllers/booking.controller.js` | confirmDeposit transaction | App Flow §4, §5.3, TRD §11.1 |
| 2.13 | `backend/src/routes/estimate.routes.js` | Estimate routes | TRD §1 |
| 2.14 | `backend/src/routes/booking.routes.js` | Booking routes | TRD §1 |

**Day 3: Messages, Notifications & Realtime**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 2.15 | `backend/src/models/Message.js` | Chat thread messages | Backend Schema §6.2 |
| 2.16 | `backend/src/models/Notification.js` | In-app notification feed | Backend Schema §6.5, PRD §6.7 |
| 2.17 | `backend/src/sockets/index.js` | Socket.IO server + auth + rooms | TRD §4.4 |
| 2.18 | `backend/src/controllers/message.controller.js` | Send, read, list messages | PRD §6.3 |
| 2.19 | `backend/src/controllers/notification.controller.js` | Create, list, mark read | PRD §6.7 |
| 2.20 | `backend/src/routes/message.routes.js` | Message routes | TRD §1 |
| 2.21 | `backend/src/routes/notification.routes.js` | Notification routes | TRD §1 |
| 2.22 | `backend/src/utils/scheduler.js` | node-cron jobs | TRD §4.5, App Flow §5 |

**Day 4: Reviews, Favorites, Feed Posts & Supporting Models**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 2.23 | `backend/src/models/Review.js` | Verified post-event reviews | Backend Schema §6.1, PRD §6.6 |
| 2.24 | `backend/src/models/Favorite.js` | Saved sellers/posts | Backend Schema §6.3, PRD §6.8 |
| 2.25 | `backend/src/models/FeedPost.js` | Seller inspiration posts | Backend Schema §6.4, PRD §6.1 |
| 2.26 | `backend/src/controllers/review.controller.js` | Create, read, reply, flag | PRD §6.6, App Flow §7 |
| 2.27 | `backend/src/controllers/favorite.controller.js` | Save/unsave, list | PRD §6.8 |
| 2.28 | `backend/src/controllers/feedPost.controller.js` | Create, read, delete posts | PRD §6.1, §6.9 |
| 2.29 | `backend/src/routes/review.routes.js` | Review routes | TRD §1 |
| 2.30 | `backend/src/routes/favorite.routes.js` | Favorite routes | TRD §1 |
| 2.31 | `backend/src/routes/feedPost.routes.js` | Feed post routes | TRD §1 |
| 2.32 | `backend/src/models/SupportPayment.js` | "Buy Us a Coffee" tips | Backend Schema §7.1 |
| 2.33 | `backend/src/models/AdminActivityLog.js` | Audit trail | Backend Schema §7.2 |
| 2.34 | `backend/src/models/Report.js` | User-submitted reports | Backend Schema §7.3 |

### 5.2 Critical Implementation Notes

**1. BookingRequest State Machine (2.2, 2.4):**
- The pre-save hook must enforce App Flow §5.1 transitions exactly.
- When status changes to `accepted`, auto-set `acceptedAt` and `expiresAt` (+48h).
- When creating a request, verify the seller has `status: 'approved'` and the date is not `booked` in `availability`.
- A customer can only have one `pending` request per seller per date.

**2. Availability & Race Condition Prevention (2.3, 2.5):**
- The `{ sellerId: 1, date: 1 }` compound unique index prevents double-booking.
- Dates are always stored as UTC midnight.
- When a request is accepted, the controller upserts an `Availability` document with `status: 'pending'`.
- The seller's calendar management endpoints must allow manual `blocked` ↔ `available` toggles.

**3. Estimate Math (2.8, 2.11):**
- The pre-save hook must auto-calculate all totals from line items (Backend Schema §5.3).
- Formula: `subtotal = Σ(qty × unitPrice)`, `discountAmount = subtotal × discount% / 100`, `afterDiscount = subtotal - discountAmount`, `serviceChargeAmount = afterDiscount × serviceCharge% / 100`, `taxAmount = afterDiscount × tax% / 100`, `total = afterDiscount + serviceChargeAmount + taxAmount`.
- When a new estimate is sent, mark previous estimates for the same `bookingRequestId` as `superseded`.

**4. confirmDeposit Transaction (2.12):**
- This is the most critical transaction in the system. Use MongoDB sessions.
- Steps in order: (a) create `LedgerEntry` with `type: 'deposit_received'`, (b) create `Booking` document, (c) update `Availability` to `booked`, (d) update `BookingRequest` to `depositConfirmed: true`.
- If any step fails, abort the entire transaction.
- Only the seller who owns the `bookingRequest` can call this endpoint.

**5. Socket.IO Architecture (2.17):**
- Authenticate sockets via JWT token in `handshake.auth.token`.
- Rooms are named `booking:{bookingRequestId}`.
- When a message is saved to MongoDB, emit `message:new` to the room.
- When an estimate is sent, emit `estimate:new` to the room.
- Typing indicators emit `typing` events to the room.

**6. Scheduled Jobs (2.22):**
- **Hourly:** Expire `BookingRequest` documents where `status: 'pending'` and `createdAt < now - 48h`.
- **Hourly:** Release Holds where `status: 'accepted'`, `depositConfirmed: false`, and `acceptedAt < now - 48h`. Revert `Availability` to `available`.
- **Daily at 1am:** Mark `Booking` documents as `completed` where `eventDate < today` and `status: 'confirmed'`.
- All jobs must be idempotent (safe to run twice).

**7. Reviews (2.23, 2.26):**
- Pre-save hook enforces: (a) booking exists, (b) booking status is `completed`, (c) reviewer is the booking's customer.
- Post-save hook updates denormalized `rating` and `reviewCount` on `SellerProfile`.
- Seller can reply once per review.
- Reviews are immediately published (no moderation queue in V1).

**8. Notifications (2.16, 2.19):**
- Every state transition that matters to a human writes a `Notification` document.
- High-value notifications also trigger email via Resend (new request, estimate received, booking confirmed).
- Socket.IO emits `notification:new` to the recipient's personal room (`user:{userId}`).

### 5.3 Phase 2 API Surface (New Endpoints)

| Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | `/api/v1/events` | Yes | customer | Create event plan |
| GET | `/api/v1/events` | Yes | customer | List my events |
| GET | `/api/v1/events/:id` | Yes | customer | Get single event |
| PUT | `/api/v1/events/:id` | Yes | customer | Update event |
| POST | `/api/v1/booking-requests` | Yes | customer | Send booking request |
| GET | `/api/v1/booking-requests` | Yes | any | List requests (customer sees own, seller sees own) |
| GET | `/api/v1/booking-requests/:id` | Yes | any | Get single request (ownership check) |
| PUT | `/api/v1/booking-requests/:id/status` | Yes | seller | Accept/decline/offer-alt-date |
| POST | `/api/v1/estimates` | Yes | seller | Create estimate |
| GET | `/api/v1/estimates` | Yes | any | List estimates for a request |
| POST | `/api/v1/estimates/:id/accept` | Yes | customer | Accept estimate |
| POST | `/api/v1/estimates/:id/reject` | Yes | customer | Reject estimate |
| POST | `/api/v1/bookings/:id/confirm-deposit` | Yes | seller | Confirm deposit received |
| GET | `/api/v1/bookings` | Yes | any | List bookings |
| GET | `/api/v1/availability/:sellerId` | No | — | Get seller calendar |
| POST | `/api/v1/availability/:sellerId` | Yes | seller | Block/unblock dates |
| GET | `/api/v1/messages/:bookingRequestId` | Yes | any | Get message thread |
| POST | `/api/v1/messages` | Yes | any | Send message |
| GET | `/api/v1/notifications` | Yes | any | Get notifications |
| PUT | `/api/v1/notifications/:id/read` | Yes | any | Mark notification read |
| POST | `/api/v1/reviews` | Yes | customer | Create review |
| GET | `/api/v1/reviews` | No | — | List seller reviews |
| POST | `/api/v1/reviews/:id/reply` | Yes | seller | Reply to review |
| POST | `/api/v1/favorites` | Yes | any | Save seller/post |
| GET | `/api/v1/favorites` | Yes | any | List favorites |
| DELETE | `/api/v1/favorites/:id` | Yes | any | Remove favorite |
| GET | `/api/v1/feed-posts` | No | — | List feed posts |
| POST | `/api/v1/feed-posts` | Yes | seller | Create feed post |
| DELETE | `/api/v1/feed-posts/:id` | Yes | seller | Delete feed post |

### 5.4 Phase 2 Checkpoint

- [ ] Customer can create a booking request → status is `pending`
- [ ] Seller can accept request → status becomes `estimate_sent`, estimate created
- [ ] Customer can accept estimate → status becomes `accepted`, availability shows `pending`
- [ ] Seller can confirm deposit → booking created, availability shows `booked`
- [ ] Messages appear in real-time via Socket.IO in the shared thread
- [ ] Notifications are created for every state transition
- [ ] 48-hour cron job correctly expires stale requests and releases holds
- [ ] Review cannot be created unless booking status is `completed`
- [ ] Post-save hook updates seller rating average correctly
- [ ] All state machine transitions reject invalid status changes

---

## 6. Phase 3: Frontend Foundation & Design System

**Goal:** The React (Vite) frontend has the complete design system, auth context, API client, and layout shell ready. No business pages yet — just the infrastructure to build them.

**Duration:** 2 days

**Why after backend:** The frontend needs real API endpoints for auth and user data to implement login/signup flows correctly. Building the design system without backend is possible but inefficient — you'll need to mock auth state.

### 6.1 File Build Order — Phase 3

**Day 1: Design System & Layout**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 3.1 | `frontend/src/lib/constants.js` | App constants, API URLs | TRD §1 |
| 3.2 | `frontend/src/lib/api.js` | Axios instance with interceptors | TRD §1 |
| 3.3 | `frontend/src/lib/auth.js` | Token helpers, auth state | TRD §1 |
| 3.4 | `frontend/src/lib/socket.js` | Socket.IO client setup | TRD §1 |
| 3.5 | `frontend/src/hooks/useAuth.js` | Auth context hook | — |
| 3.6 | `frontend/src/hooks/useSocket.js` | Socket connection hook | — |
| 3.7 | `frontend/src/hooks/useNotifications.js` | Notification polling hook | — |
| 3.8 | `frontend/src/components/layout/Header.jsx` | Site header with search | UI/UX Brief §9 |
| 3.9 | `frontend/src/components/layout/Footer.jsx` | Site footer | UI/UX Brief §9 |
| 3.10 | `frontend/src/components/layout/Shell.jsx` | Page shell wrapper | — |
| 3.11 | `frontend/src/components/ui/` | shadcn/ui components | UI/UX Brief §5 |

**Day 2: Auth Pages & Providers**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 3.12 | `frontend/src/routes/public/sign-up.jsx` | Signup form (customer/seller) | PRD §6.2, App Flow §2 |
| 3.13 | `frontend/src/routes/public/login.jsx` | Login form | PRD §6.2 |
| 3.14 | `frontend/src/components/auth/AuthProvider.jsx` | Auth context provider | — |
| 3.15 | `frontend/src/components/auth/ProtectedRoute.jsx` | Role-gated route wrapper | PRD §5 |
| 3.16 | `frontend/src/routes/customer-layout.jsx` | Customer dashboard layout | App Flow §1 |
| 3.17 | `frontend/src/routes/seller-layout.jsx` | Seller dashboard layout | App Flow §1 |
| 3.18 | `frontend/src/routes/admin-layout.jsx` | Admin panel layout | App Flow §1 |
| 3.19 | `frontend/src/components/layout/Sidebar.jsx` | Dashboard sidebar | UI/UX Brief §9 |
| 3.20 | `frontend/src/components/layout/MobileNav.jsx` | Mobile bottom/tab nav | UI/UX Brief §3 |

### 6.2 Critical Implementation Notes

**1. API Client (3.2):**
- Axios instance with `withCredentials: true` (for httpOnly cookies).
- Request interceptor: no token needed (cookies handle it).
- Response interceptor: on 401, attempt refresh via `POST /api/v1/auth/refresh`, then retry original request once. If refresh fails, redirect to login.

**2. Auth Context (3.5, 3.14):**
- On mount, call `GET /api/v1/auth/me` to hydrate user state.
- Expose `user`, `isLoading`, `login()`, `logout()`, `isCustomer`, `isSeller`, `isAdmin`.
- Logout calls `POST /api/v1/auth/logout` and clears local state.

**3. Socket Client (3.4, 3.6):**
- Connect on auth success, disconnect on logout.
- Auto-reconnect with exponential backoff.
- Join `booking:{id}` rooms when entering a message thread.
- Listen for `message:new`, `estimate:new`, `typing`, `notification:new`.

**4. Role-Based Layouts (3.16-3.18):**
- Use React (Vite) route groups `(customer)`, `(seller)`, `(admin)` as defined in TRD §1.
- Each layout checks auth + role. Unauthenticated users redirect to `/login` with `?redirect=` param.
- Sellers with `status: 'pending'` see a "under review" banner instead of dashboard content.

**5. Design System (3.11):**
- Install shadcn/ui components via CLI: `button`, `input`, `select`, `dialog`, `sheet`, `tabs`, `table`, `card`, `calendar`, `command`, `popover`, `toast`, `badge`, `avatar`, `dropdown-menu`, `separator`, `skeleton`.
- Theme all components via CSS variables in `globals.css` using the exact tokens from UI/UX Brief §2.
- Create custom components: `StarRating`, `VerifiedBadge`, `PriceDisplay`, `StatusPill`.

### 6.3 Phase 3 Checkpoint

- [ ] shadcn/ui components render with correct brand colors in both light and dark mode
- [ ] Signup page creates user and redirects to login
- [ ] Login page sets cookies and redirects to appropriate dashboard
- [ ] Auth context correctly hydrates user on page refresh
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Role-gated routes reject wrong-role users with 403
- [ ] Socket.IO connects and disconnects with auth state
- [ ] Mobile nav appears below 768px, sidebar appears above

---

## 7. Phase 4: Public Discovery Pages

**Goal:** All public-facing pages work: Home, Explore/Search, Seller Profile, Category Landing, Inspiration Feed. These are the pages that drive SEO and user acquisition.

**Duration:** 3 days

**Dependencies:** Phase 1 (search API, seller data), Phase 3 (design system, layout).

### 7.1 File Build Order — Phase 4

**Day 1: Home Page & Search Infrastructure**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 4.1 | `frontend/src/components/search/SearchBar.jsx` | Hero search bar | PRD §6.1, UI/UX Brief §9 |
| 4.2 | `frontend/src/components/search/FilterPanel.jsx` | Category-specific filters | PRD §6.1 |
| 4.3 | `frontend/src/components/search/ResultCard.jsx` | Seller result card | UI/UX Brief §5 |
| 4.4 | `frontend/src/components/search/MapView.jsx` | MapLibre map with pins | TRD §10.3, UI/UX Brief §8 |
| 4.5 | `frontend/src/routes/public/index.jsx` | Home page (full) | PRD §6.1, UI/UX Brief §9 |
| 4.6 | `frontend/src/components/home/HeroSection.jsx` | GSAP-pinned hero | UI/UX Brief §7, §9 |
| 4.7 | `frontend/src/components/home/HowItWorks.jsx` | 6-step explainer | PRD §6.1, UI/UX Brief §7 |
| 4.8 | `frontend/src/components/home/FeaturedSellers.jsx` | Featured sellers rail | PRD §6.1 |
| 4.9 | `frontend/src/components/home/FeedPreview.jsx` | Inspiration feed preview | PRD §6.1 |
| 4.10 | `frontend/src/components/home/Testimonials.jsx` | Verified review testimonials | PRD §6.1 |

**Day 2: Explore/Search Page**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 4.11 | `frontend/src/routes/public/explore.jsx` | Search results page | PRD §6.1, App Flow §2 |
| 4.12 | `frontend/src/components/search/SortDropdown.jsx` | Sort controls | PRD §6.1 |
| 4.13 | `frontend/src/components/search/EmptyState.jsx` | No results state | UI/UX Brief §10 |
| 4.14 | `frontend/src/hooks/useSearch.js` | Search query hook (TanStack Query) | — |
| 4.15 | `frontend/src/hooks/useMapData.js` | Map pin data hook | — |

**Day 3: Seller Profile & Category Pages**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 4.16 | `frontend/src/routes/public/seller/_slug.jsx` | Seller storefront | PRD §6.1, App Flow §2 |
| 4.17 | `frontend/src/components/seller/SellerHeader.jsx` | Cover + name + actions | UI/UX Brief §9 |
| 4.18 | `frontend/src/components/seller/GalleryGrid.jsx` | Photo gallery + lightbox | TRD §10.2, UI/UX Brief §8 |
| 4.19 | `frontend/src/components/seller/ServiceList.jsx` | Services/packages list | PRD §6.1 |
| 4.20 | `frontend/src/components/seller/MenuSection.jsx` | Catering menu (conditional) | PRD §6.1 |
| 4.21 | `frontend/src/components/seller/CalendarWidget.jsx` | Read-only availability | PRD §6.4, UI/UX Brief §9 |
| 4.22 | `frontend/src/components/seller/ReviewList.jsx` | Reviews with replies | PRD §6.6 |
| 4.23 | `frontend/src/components/seller/RequestBookingPanel.jsx` | Booking request form drawer | PRD §6.3, App Flow §2 |
| 4.24 | `frontend/src/routes/public/venues/sukkur.jsx` | Category landing (SEO) | PRD §6.1, TRD §13 |
| 4.25 | `frontend/src/routes/public/catering/sukkur.jsx` | Category landing | PRD §6.1 |
| 4.26 | `frontend/src/routes/public/photography/sukkur.jsx` | Category landing | PRD §6.1 |
| 4.27 | `frontend/src/routes/public/decoration/sukkur.jsx` | Category landing | PRD §6.1 |
| 4.28 | `frontend/src/routes/public/feed.jsx` | Inspiration feed | PRD §6.1 |

### 7.2 Critical Implementation Notes

**1. Home Page (4.5-4.10):**
- Hero section uses GSAP ScrollTrigger for pinning (UI/UX Brief §7).
- Search bar pre-fills category, city (Sukkur), date, guest count and navigates to `/explore?category=X&city=Sukkur`.
- "How It Works" uses Magic UI animated beams connecting the 6 steps.
- Featured sellers fetched from `GET /api/v1/search?isFeatured=true&limit=6`.
- Feed preview fetches latest 6 posts from `GET /api/v1/feed-posts?limit=6`.
- Testimonials fetch from `GET /api/v1/reviews?verified=true&limit=3`.

**2. Explore Page (4.11):**
- URL query params drive filter state (shareable searches).
- List view and map view are equal citizens — toggle button, not tabs.
- On desktop: map is sticky on the right, list scrolls on the left.
- On mobile: full-screen toggle between list and map.
- "Search this area" button appears after map drag (TRD §10.3).
- Results use TanStack Query with infinite scroll or pagination.
- Empty state suggests broadening filters (UI/UX Brief §10).

**3. Seller Profile (4.16-4.23):**
- This is the highest-craft page in the product (UI/UX Brief §9).
- Cover image is full-bleed at top.
- Information hierarchy: About → Gallery → Services/Menu → Availability → Reviews → Location → Policies.
- "Request Booking" CTA is sticky on mobile.
- Calendar widget shows available/booked/pending in green/amber/red (UI/UX Brief §5).
- Gallery uses `yet-another-react-lightbox` (TRD §10.2).
- If user is not logged in, "Request Booking" redirects to `/sign-up?redirect=/seller/_slug` (App Flow §2, step 5).

**4. SEO (4.24-4.28):**
- Category pages use React (Vite) Metadata API with JSON-LD `LocalBusiness` structured data.
- Dynamic OG images for seller profiles using `ImageResponse` (TRD §10.5).
- Sitemap generated in `app/sitemap.js` (TRD §10.6).

### 7.3 Phase 4 Checkpoint

- [ ] Home page renders with all sections, animations, and working search bar
- [ ] `/explore` returns search results with filters, sorting, and map view
- [ ] Clicking a result navigates to `/seller/_slug` with full profile data
- [ ] Seller profile shows gallery, services, calendar, reviews, location
- [ ] Unauthenticated "Request Booking" redirects to signup with return path preserved
- [ ] Category landing pages (`/venues/sukkur`) render with SEO metadata
- [ ] Inspiration feed (`/feed`) shows seller posts chronologically
- [ ] All pages are responsive down to 375px width

---

## 8. Phase 5: Customer Account & Booking Flow

**Goal:** The entire customer journey after signup works: dashboard, event planning, booking requests, estimate viewing/acceptance, chat/negotiation, favorites, reviews, and settings.

**Duration:** 3 days

**Dependencies:** Phase 2 (all booking APIs), Phase 3 (auth, layouts), Phase 4 (seller profiles).

### 8.1 File Build Order — Phase 5

**Day 1: Dashboard, Events & Requests**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 5.1 | `frontend/src/routes/customer/dashboard.jsx` | Customer dashboard home | PRD §6.2 |
| 5.2 | `frontend/src/components/dashboard/StatCard.jsx` | Dashboard stat cards | — |
| 5.3 | `frontend/src/components/dashboard/RequestList.jsx` | Booking requests list | PRD §6.2 |
| 5.4 | `frontend/src/routes/customer/events.jsx` | My Events list | PRD §6.2, App Flow §2 |
| 5.5 | `frontend/src/routes/customer/events/_id.jsx` | Single event plan | PRD §6.2 |
| 5.6 | `frontend/src/components/events/EventPlanner.jsx` | Event creation/edit form | PRD §6.2 |
| 5.7 | `frontend/src/routes/customer/requests.jsx` | Booking requests page | PRD §6.2 |
| 5.8 | `frontend/src/routes/customer/estimates.jsx` | Estimates received | PRD §6.2 |

**Day 2: Chat, Negotiation & Estimates**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 5.9 | `frontend/src/routes/customer/messages.jsx` | Messages list | PRD §6.2 |
| 5.10 | `frontend/src/routes/customer/messages/_id.jsx` | Conversation thread | PRD §6.3, App Flow §3 |
| 5.11 | `frontend/src/components/booking/ChatThread.jsx` | Message bubbles + cards | UI/UX Brief §9 |
| 5.12 | `frontend/src/components/booking/EstimateCard.jsx` | Structured estimate card | PRD §6.3, UI/UX Brief §5 |
| 5.13 | `frontend/src/components/booking/BookingSummaryCard.jsx` | Booking summary card | PRD §6.3 |
| 5.14 | `frontend/src/components/booking/LedgerPanel.jsx` | Payment ledger view | PRD §6.5 |
| 5.15 | `frontend/src/hooks/useMessages.js` | Message query + mutation | — |
| 5.16 | `frontend/src/hooks/useBookingRequest.js` | Booking request state hook | — |

**Day 3: Favorites, Reviews & Settings**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 5.17 | `frontend/src/routes/customer/favorites.jsx` | Saved sellers/posts | PRD §6.8 |
| 5.18 | `frontend/src/components/favorites/CompareDrawer.jsx` | Compare up to 3 sellers | PRD §6.8 |
| 5.19 | `frontend/src/routes/customer/reviews.jsx` | Reviews I've left | PRD §6.6 |
| 5.20 | `frontend/src/components/reviews/ReviewForm.jsx` | Create review form | PRD §6.6 |
| 5.21 | `frontend/src/routes/customer/settings.jsx` | Profile settings | PRD §6.2 |
| 5.22 | `frontend/src/routes/customer/notifications.jsx` | Notification feed | PRD §6.7 |
| 5.23 | `frontend/src/components/notifications/NotificationBell.jsx` | Bell icon + dropdown | PRD §6.7 |

### 8.2 Critical Implementation Notes

**1. Booking Request Form (4.23, continued):**
- Fields: event type (select), date (calendar picker), time window, guest count, budget range, special requirements, message.
- Date picker must disable dates where `availability.status === 'booked'` for that seller.
- On submit, create `BookingRequest` and redirect to `/messages/[bookingRequestId]`.

**2. Chat Thread (5.10-5.11):**
- Messages load via `GET /api/v1/messages/:bookingRequestId`.
- New messages sent via `POST /api/v1/messages` + Socket.IO emit.
- Structured cards (estimates, booking summaries) render differently from text bubbles.
- Estimate card shows line items, totals, validity date, and Accept/Reject/Request Changes buttons.
- When customer accepts estimate: `POST /api/v1/estimates/:id/accept` → status updates, calendar hold created.

**3. Estimate Card (5.12):**
- Must display the full math breakdown: subtotal, discount, service charge, tax, total.
- Show version number if superseded.
- Accept action triggers a confirmation dialog ("This will place a 48-hour hold on the date").

**4. Ledger Panel (5.14):**
- Shows all `ledgerEntries` for the booking request.
- Customer can mark "I've sent the deposit" (creates `deposit_sent` entry).
- Seller can mark "Deposit received" (creates `deposit_received` entry, triggers booking confirmation).
- This is a trust record, not a payment processor UI.

**5. Compare Tool (5.18):**
- Select up to 3 same-category sellers from favorites.
- Side-by-side comparison: price, rating, capacity, key inclusions, review count.
- Can be a modal/drawer, not necessarily a separate route.

**6. Review Form (5.20):**
- Only accessible when a booking has `status: 'completed'`.
- Overall rating (1-5 stars) + 4 sub-ratings + text (min 10 chars) + optional photos.
- Photos uploaded to Cloudinary `public/reviews/{reviewId}/`.

### 8.3 Phase 5 Checkpoint

- [ ] Customer dashboard shows upcoming events, open requests, unread messages
- [ ] Customer can create an event plan and link booking requests to it
- [ ] Customer can send a booking request from a seller profile
- [ ] Chat thread shows messages and estimate cards in real-time
- [ ] Customer can accept an estimate, creating a 48-hour hold
- [ ] Customer can view and manage favorites, including compare tool
- [ ] Customer can leave a review only for completed bookings
- [ ] Notification bell shows unread count and dropdown list
- [ ] All customer routes are protected and role-gated

---

## 9. Phase 6: Seller Dashboard

**Goal:** The entire seller experience works: onboarding wizard, dashboard home, profile management, services/menu, calendar, requests inbox, estimate builder, messages, gallery, feed posts, reviews, analytics, and settings.

**Duration:** 4 days

**Dependencies:** Phase 2 (all seller APIs), Phase 3 (auth, layouts), Phase 5 (chat/negotiation UI — can reuse components).

### 9.1 File Build Order — Phase 6

**Day 1: Onboarding & Dashboard Home**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 6.1 | `frontend/src/routes/seller/seller-dashboard/onboarding.jsx` | 6-step wizard | PRD §6.9, App Flow §6 |
| 6.2 | `frontend/src/components/onboarding/OnboardingWizard.jsx` | Wizard container | App Flow §6 |
| 6.3 | `frontend/src/components/onboarding/Step1BusinessInfo.jsx` | Business info form | App Flow §6 |
| 6.4 | `frontend/src/components/onboarding/Step2Visuals.jsx` | Logo/cover/gallery upload | App Flow §6 |
| 6.5 | `frontend/src/components/onboarding/Step3Services.jsx` | Add services/menu | App Flow §6 |
| 6.6 | `frontend/src/components/onboarding/Step4Availability.jsx` | Working hours + blocked dates | App Flow §6 |
| 6.7 | `frontend/src/components/onboarding/Step5Social.jsx` | Social links | App Flow §6 |
| 6.8 | `frontend/src/components/onboarding/Step6Submit.jsx` | Review + submit | App Flow §6 |
| 6.9 | `frontend/src/routes/seller/seller-dashboard.jsx` | Seller dashboard home | PRD §6.9 |
| 6.10 | `frontend/src/components/dashboard/SellerStats.jsx` | Seller stat cards | PRD §6.9 |

**Day 2: Profile, Services, Menu & Calendar**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 6.11 | `frontend/src/routes/seller/seller-dashboard/profile.jsx` | Edit profile | PRD §6.9 |
| 6.12 | `frontend/src/routes/seller/seller-dashboard/services.jsx` | Manage services | PRD §6.9 |
| 6.13 | `frontend/src/routes/seller/seller-dashboard/menu.jsx` | Manage menu (catering) | PRD §6.9 |
| 6.14 | `frontend/src/routes/seller/seller-dashboard/packages.jsx` | Manage packages | PRD §6.9 |
| 6.15 | `frontend/src/routes/seller/seller-dashboard/calendar.jsx` | Availability calendar | PRD §6.4, §6.9 |
| 6.16 | `frontend/src/components/calendar/SellerCalendar.jsx` | Month view calendar | UI/UX Brief §9 |
| 6.17 | `frontend/src/components/calendar/CalendarDayCell.jsx` | Individual date cell | UI/UX Brief §5 |
| 6.18 | `frontend/src/components/services/ServiceForm.jsx` | Create/edit service form | — |
| 6.19 | `frontend/src/components/services/MenuBuilder.jsx` | Menu category + item builder | — |

**Day 3: Requests Inbox & Estimate Builder**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 6.20 | `frontend/src/routes/seller/seller-dashboard/requests.jsx` | Requests inbox | PRD §6.9, App Flow §3 |
| 6.21 | `frontend/src/components/requests/RequestDetail.jsx` | Single request view | App Flow §3 |
| 6.22 | `frontend/src/components/requests/RequestActions.jsx` | Accept/decline/ask-details | App Flow §3 |
| 6.23 | `frontend/src/routes/seller/seller-dashboard/estimates/new/_requestId.jsx` | Estimate builder | PRD §6.3, App Flow §3 |
| 6.24 | `frontend/src/components/estimates/EstimateBuilder.jsx` | Line item builder | PRD §6.3 |
| 6.25 | `frontend/src/components/estimates/LineItemRow.jsx` | Single line item | — |
| 6.26 | `frontend/src/components/estimates/EstimatePreview.jsx` | Live total preview | — |
| 6.27 | `frontend/src/routes/seller/seller-dashboard/messages.jsx` | Messages list | PRD §6.9 |
| 6.28 | `frontend/src/routes/seller/seller-dashboard/messages/_id.jsx` | Conversation thread | PRD §6.9 |

**Day 4: Gallery, Feed, Reviews, Analytics & Settings**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 6.29 | `frontend/src/routes/seller/seller-dashboard/gallery.jsx` | Gallery management | PRD §6.9 |
| 6.30 | `frontend/src/routes/seller/seller-dashboard/feed-posts.jsx` | Feed post management | PRD §6.9 |
| 6.31 | `frontend/src/routes/seller/seller-dashboard/reviews.jsx` | Reviews + replies | PRD §6.9 |
| 6.32 | `frontend/src/routes/seller/seller-dashboard/analytics.jsx` | Basic analytics | PRD §6.9 |
| 6.33 | `frontend/src/routes/seller/seller-dashboard/settings.jsx` | Seller settings | PRD §6.9 |
| 6.34 | `frontend/src/components/gallery/GalleryUploader.jsx` | Multi-image upload | TRD §10.2 |
| 6.35 | `frontend/src/components/analytics/AnalyticsChart.jsx` | Simple charts | — |
| 6.36 | `frontend/src/components/reviews/SellerReplyForm.jsx` | Reply to review | PRD §6.6 |

### 9.2 Critical Implementation Notes

**1. Onboarding Wizard (6.1-6.8):**
- 6 steps as defined in App Flow §6.
- Each step saves independently — seller can resume at any step.
- `onboardingStep` and `onboardingCompleted` fields on `SellerProfile` track progress.
- Step 3 requires at least one service (or menu category for catering) before allowing submission.
- Step 6 uploads verification documents to Cloudinary private folder.
- On submit, `status` becomes `pending`. Seller sees "under review" state.

**2. Seller Calendar (6.15-6.17):**
- Month view is the V1 requirement (no week/day view).
- Color coding: green = available, amber = pending, red = booked, gray = blocked.
- Clicking a date toggles between available/blocked (for seller's own calendar).
- Dates with `pending` or `booked` status cannot be manually toggled (they're controlled by the booking flow).
- Touch targets must be minimum 44x44px on mobile (UI/UX Brief §11).

**3. Estimate Builder (6.23-6.26):**
- Category-specific builders:
  - **Venue:** Select service/package, adjust price, add discount/service charge/tax.
  - **Catering:** Pick menu items from published menu; running total calculates live as items and guest count change.
  - **Photography:** Select package, add-ons (drone, extra hours, album), number of photographers.
  - **Decoration:** Select theme/style, area size, inclusions.
- Live math preview updates as line items change.
- Validity date defaults to 7 days from now.
- On send, creates `Estimate` document and emits to Socket.IO room.

**4. Requests Inbox (6.20-6.22):**
- Filter by status: pending, estimate_sent, negotiating, accepted, rejected.
- Each request card shows: customer name, event type, date, guest count, message preview, status pill.
- Actions: Accept & Build Estimate → navigates to estimate builder. Decline → confirmation dialog. Ask for details → opens message thread. Offer alternative date → date picker.

**5. Analytics (6.32-6.35):**
- V1 is basic counts only: profile views, search appearances, requests received/accepted/rejected, most-viewed service, review trend over time.
- No cohort or funnel analytics in V1.
- Use simple bar/line charts (recharts or chart.js).

### 9.3 Phase 6 Checkpoint

- [ ] New seller can complete 6-step onboarding and submit for approval
- [ ] Seller dashboard shows pending requests, upcoming bookings, unread messages
- [ ] Seller can manage services, menu, packages, and gallery
- [ ] Seller calendar shows correct colors and allows blocking dates
- [ ] Seller can build and send structured estimates from the estimate builder
- [ ] Seller can accept/decline/negotiate booking requests
- [ ] Seller can confirm deposit receipt, creating a confirmed booking
- [ ] Seller can reply to reviews and view basic analytics
- [ ] All seller routes are protected and ownership-verified

---
## 10. Phase 7: Admin Panel

**Goal:** The admin dashboard works: seller approval queue, user management, category/city management, booking oversight, review moderation, reports, homepage content, and platform analytics.

**Duration:** 2 days

**Dependencies:** Phase 1 (admin seed), Phase 2 (all models), Phase 3 (admin layout).

### 10.1 File Build Order — Phase 7

**Day 1: Admin Core**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 7.1 | `frontend/src/routes/admin/admin.jsx` | Admin dashboard home | PRD §6.10 |
| 7.2 | `frontend/src/components/admin/AdminStats.jsx` | Platform totals | PRD §6.10 |
| 7.3 | `frontend/src/routes/admin/admin/sellers.jsx` | Seller approval queue | PRD §6.10, App Flow §8 |
| 7.4 | `frontend/src/routes/admin/admin/sellers/_id.jsx` | Application review detail | PRD §6.10 |
| 7.5 | `frontend/src/components/admin/SellerApprovalCard.jsx` | Seller application card | — |
| 7.6 | `frontend/src/components/admin/DocumentViewer.jsx` | CNIC/doc viewer (signed URL) | Backend Schema §11.2 |
| 7.7 | `frontend/src/routes/admin/admin/users.jsx` | User management | PRD §6.10 |
| 7.8 | `frontend/src/routes/admin/admin/bookings.jsx` | Booking oversight (read-only) | PRD §6.10 |

**Day 2: Moderation & Content Management**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 7.9 | `frontend/src/routes/admin/admin/reviews-reports.jsx` | Reviews + reports queue | PRD §6.10, App Flow §8 |
| 7.10 | `frontend/src/routes/admin/admin/categories.jsx` | Category management | PRD §6.10 |
| 7.11 | `frontend/src/routes/admin/admin/cities.jsx` | City management | PRD §6.10 |
| 7.12 | `frontend/src/routes/admin/admin/homepage-content.jsx` | Featured sellers, hero | PRD §6.10 |
| 7.13 | `frontend/src/routes/admin/admin/analytics.jsx` | Platform analytics | PRD §6.10 |
| 7.14 | `backend/src/controllers/admin.controller.js` | Admin actions + audit log | PRD §6.10, Backend Schema §7.2 |
| 7.15 | `backend/src/routes/admin.routes.js` | Admin route definitions | TRD §1 |

### 10.2 Critical Implementation Notes

**1. Seller Approval Queue (7.3-7.6):**
- Table shows: business name, category, submitted date, status, actions.
- Detail view shows all onboarding data + verification documents.
- Documents fetched via signed Cloudinary URLs (5-minute expiry).
- Approve action: `status → approved`, send notification + email.
- Reject action: `status → rejected`, require reason, send notification with reason.
- All admin actions write to `adminActivityLogs` (Backend Schema §7.2).

**2. Booking Oversight (7.8):**
- Read-only view of all bookings for support/dispute resolution.
- Search by booking ID, customer name, seller name, or date.
- Links to the full conversation thread for context.

**3. Review Moderation (7.9):**
- Flagged reviews appear in a queue with reason.
- Admin can remove review (soft delete: `isDeleted: true`).
- Admin can dismiss flag.
- All moderation actions are logged.

### 10.3 Phase 7 Checkpoint

- [ ] Admin dashboard shows platform totals and pending approvals count
- [ ] Admin can view seller applications with verification documents
- [ ] Admin can approve/reject sellers with logged reasons
- [ ] Admin can manage categories and cities (add/edit/deactivate)
- [ ] Admin can view all bookings read-only for support
- [ ] Admin can moderate flagged reviews and reports
- [ ] Admin can set featured sellers for homepage
- [ ] All admin actions are written to `adminActivityLogs`

---

## 11. Phase 8: Platform Features, Payments & Polish

**Goal:** "Buy Us a Coffee" payment flow, SEO infrastructure, scheduled jobs, email notifications, error handling, and final polish.

**Duration:** 3 days

**Dependencies:** All previous phases.

### 11.1 File Build Order — Phase 8

**Day 1: Payments & Platform Support**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 8.1 | `backend/src/controllers/supportPayment.controller.js` | Safepay checkout + webhook | PRD §6.5, TRD §10.4, §11.2 |
| 8.2 | `backend/src/routes/supportPayment.routes.js` | Support payment routes | TRD §1 |
| 8.3 | `frontend/src/components/support/CoffeeModal.jsx` | "Buy Us a Coffee" UI | PRD §6.5, UI/UX Brief §9 |
| 8.4 | `frontend/src/routes/public/about.jsx` | About page | PRD §6.1 |
| 8.5 | `frontend/src/routes/public/contact.jsx` | Contact page | PRD §6.1 |
| 8.6 | `frontend/src/routes/public/faq.jsx` | FAQ page | PRD §6.1 |

**Day 2: SEO, Email & Jobs**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 8.7 | `frontend/src/lib/sitemap.js` | Dynamic sitemap generation | TRD §10.6 |
| 8.8 | `backend/src/routes/meta.routes.js` | robots.txt | TRD §13 |
| 8.9 | `backend/src/routes/meta.routes.js (OG image route)` | OG image generation | TRD §10.5 |
| 8.10 | `backend/src/utils/email.js` | Resend email wrapper | TRD §1, §12 |
| 8.11 | `backend/src/utils/emailTemplates.js` | JSX email templates | — |
| 8.12 | `backend/src/utils/scheduler.js` | Cron jobs (finalize) | TRD §4.5 |
| 8.13 | `backend/src/middleware/rateLimit.middleware.js` | Rate limiting | TRD §14 |

**Day 3: Polish & Error Handling**

| Order | File | Purpose | Companion Doc Ref |
|---|---|---|---|
| 8.14 | `frontend/src/components/shared/AnimatedSection.jsx` | GSAP scroll animations | UI/UX Brief §7 |
| 8.15 | `frontend/src/components/shared/StarRating.jsx` | Reusable star rating | UI/UX Brief §5 |
| 8.16 | `frontend/src/components/shared/VerifiedBadge.jsx` | Verified seller badge | UI/UX Brief §5 |
| 8.17 | `frontend/src/components/shared/PriceDisplay.jsx` | PKR price formatting | — |
| 8.18 | `frontend/src/components/shared/StatusPill.jsx` | Consistent status pills | UI/UX Brief §5 |
| 8.19 | `frontend/src/components/shared/SkeletonCard.jsx` | Loading skeletons | UI/UX Brief §10 |
| 8.20 | `frontend/src/components/shared/EmptyState.jsx` | Empty state patterns | UI/UX Brief §10 |
| 8.21 | `frontend/src/routes/public-layout.jsx` | Public layout finalization | — |

### 11.2 Critical Implementation Notes

**1. "Buy Us a Coffee" (8.1-8.3):**
- Completely decoupled from booking flow (PRD §6.5).
- Preset amounts: PKR 100, 300, 500 + custom input.
- Safepay checkout session created via `POST /api/v1/support-payments/checkout`.
- Webhook verifies signature with `SAFEPAY_WEBHOOK_SECRET`.
- On success, write `SupportPayment` document with status `completed`.
- Entry points: footer, About page, one-time prompt after booking confirmation.

**2. Email Notifications (8.10-8.11):**
- Use Resend with React JSX templates.
- Trigger emails at these transitions:
  - Seller: new booking request received
  - Customer: estimate received
  - Customer: booking confirmed (deposit received)
  - Seller: profile approved/rejected
- All other notifications are in-app only (PRD §6.7).

**3. Scheduled Jobs (8.12):**
- Finalize and test all three cron jobs:
  - **Hourly:** Expire stale `pending` requests (>48h)
  - **Hourly:** Release holds without deposit confirmation (>48h)
  - **Daily 1am:** Mark past confirmed bookings as `completed`
- Jobs must log their execution and handle errors gracefully.

**4. Rate Limiting (8.13):**
- Apply to all public mutation endpoints: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`, `POST /api/v1/booking-requests`, `POST /api/v1/messages`, etc.
- Limit: 100 requests per 15 minutes per IP.
- Return 429 with `Retry-After` header.

### 11.3 Phase 8 Checkpoint

- [ ] "Buy Us a Coffee" flow works end-to-end with Safepay sandbox
- [ ] Webhook correctly verifies signature and writes SupportPayment
- [ ] Sitemap generates dynamically from backend data
- [ ] OG images render for seller profiles
- [ ] Email templates send correctly via Resend
- [ ] All cron jobs run on schedule and handle errors
- [ ] Rate limiting blocks excessive requests
- [ ] All loading, empty, and error states are implemented
- [ ] `prefers-reduced-motion` respected globally

---

## 12. Testing Strategy

### 12.1 Testing Pyramid for AI Agents

| Layer | Tool | Coverage Target | When |
|---|---|---|---|
| **Unit** | Jest (backend) + Vitest (frontend) | Utils, helpers, formatters, math | Continuous |
| **Integration** | Jest + supertest | API endpoints, controllers, middleware | After each phase |
| **Database** | Jest + mongodb-memory-server | Schema validation, hooks, state machines | After Phase 1-2 |
| **E2E** | Playwright | Critical user flows | After Phase 8 |

### 12.2 Critical Test Cases (Minimum Viable Test Suite)

**Auth & Identity:**
- Signup creates user with hashed password
- Login returns cookies and rejects wrong password
- `auth.middleware` blocks requests without valid cookies
- `role.middleware` blocks cross-role access

**Booking State Machine:**
- Invalid status transitions are rejected by pre-save hooks
- `accepted` auto-sets `acceptedAt` and `expiresAt`
- `confirmDeposit` creates Booking + updates Availability atomically
- Double-booking is prevented by unique index

**Estimate Math:**
- Line items calculate subtotal correctly
- Discount, service charge, tax apply in correct order
- Total never negative

**Availability:**
- UTC midnight storage is consistent
- Manual block/unblock works for available dates
- Cannot manually toggle pending/booked dates

**Reviews:**
- Cannot create review for non-completed booking
- Cannot create review for someone else's booking
- Post-save hook updates SellerProfile rating average

### 12.3 Manual Testing Checklist

Before deployment, manually verify:

**Guest Flow:**
- [ ] Search for "marriage hall" returns relevant results
- [ ] Filter by category, area, price range works
- [ ] Map view shows pins and clusters
- [ ] Seller profile loads with all sections
- [ ] Request Booking redirects to signup when guest

**Customer Flow:**
- [ ] Signup → login → browse → request → chat → accept → deposit marked
- [ ] Event plan tracks status correctly
- [ ] Notifications appear in real-time
- [ ] Review form only appears for completed bookings

**Seller Flow:**
- [ ] Onboarding wizard saves progress per step
- [ ] Calendar blocks/unblocks dates correctly
- [ ] Estimate builder calculates totals live
- [ ] Confirm deposit creates confirmed booking

**Admin Flow:**
- [ ] Approve seller → seller appears in search
- [ ] Reject seller → seller sees reason and can resubmit
- [ ] Moderate review → review disappears from public profile

---

## 13. Deployment Runbook

### 13.1 Pre-Deployment Checklist

- [ ] All env vars are set in production (both Netlify/Vercel and Northflank)
- [ ] MongoDB Atlas M0 cluster is created and whitelisted for Northflank IP
- [ ] Cloudinary folder structure exists (public/ and private/)
- [ ] Resend domain is verified (or use `onboarding@resend.dev` for testing)
- [ ] Safepay webhook URL is configured to `https://api.dreamevents.com/api/v1/support-payments/webhook`
- [ ] Seed scripts have been run in production (categories, cities, admin)
- [ ] All tests pass
- [ ] No `console.log` statements in production code (use a logger instead)

### 13.2 Deployment Steps

**Step 1: Backend (Northflank)**
1. Push `main` branch to GitHub
2. Northflank auto-detects Dockerfile and builds
3. Set environment variables in Northflank dashboard
4. Configure health check endpoint: `GET /api/v1/health`
5. Verify backend responds at `https://api.dreamevents.com/api/v1/health`

**Step 2: Database**
1. Run seed script: `node backend/dist/seeds/index.js`
2. Verify categories, cities, and admin user exist
3. Create Atlas Search index `seller_search` (Backend Schema §9.1)

**Step 3: Frontend (Netlify/Vercel)**
1. Push `main` branch to GitHub
2. Netlify/Vercel auto-deploys
3. Set environment variables in Netlify/Vercel dashboard
4. Verify frontend loads at `https://dreamevents.com`
5. Test API connectivity from frontend to backend

**Step 4: Domain & DNS**
1. Configure custom domain in Netlify/Vercel: `dreamevents.com`
2. Configure custom domain in Northflank: `api.dreamevents.com`
3. Set DNS A/CNAME records at registrar
4. Verify SSL certificates auto-provision

**Step 5: Post-Deploy Verification**
1. Run full manual testing checklist (Section 12.3)
2. Verify cron jobs are running (check logs)
3. Verify Socket.IO connections work
4. Send test email via Resend
5. Upload test image to Cloudinary
6. Process test Safepay payment

### 13.3 Rollback Plan

If critical issues are found post-deploy:

1. **Backend:** Northflank supports instant rollback to previous build
2. **Frontend:** Netlify/Vercel supports instant rollback to previous deployment
3. **Database:** Never rollback data — fix forward with migrations
4. **Emergency switch:** Set `MAINTENANCE_MODE=true` env var to show maintenance page

---

## 14. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MongoDB Atlas M0 storage limit (512MB) | Medium | High | Monitor with Atlas alerts; images in Cloudinary (URLs only in DB); upgrade to M10 ($60/mo) when approaching 400MB |
| Atlas Search index limits on M0 | Medium | Medium | Fallback to text index already implemented; monitor query performance |
| Netlify/Vercel Hobby non-commercial clause | Low | High | Keep "Buy Us a Coffee" as only monetization; upgrade to Pro ($20/mo) before any commercial marketing |
| Northflank free tier policy change | Low | Medium | Backend is single service; Render is fallback (with cold-start caveat) |
| Cloudinary free tier exceeded (25 credits) | Medium | Medium | Enable auto-quality, responsive images, aggressive caching; upgrade to Plus ($25/mo) if needed |
| Safepay integration complexity | Medium | Medium | Use sandbox thoroughly; webhook signature verification is mandatory; keep tip flow isolated from booking flow |
| Socket.IO scaling issues | Low | Medium | V1 traffic is low; if needed, add Redis adapter later |
| Seller onboarding abandonment | High | Medium | Progressive save after each step; email reminder after 24h; clear "your profile is X% complete" indicator |
| Fake/duplicate seller accounts | Medium | High | Admin approval gate; CNIC verification; manual review of first 50 sellers |

---

## 15. Appendix A: Complete API Endpoint Inventory

### Auth
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/auth/signup` | No | `{ email, password, name, role, phone? }` | User + cookies |
| POST | `/api/v1/auth/login` | No | `{ email, password }` | User + cookies |
| POST | `/api/v1/auth/refresh` | No | — | New access token |
| POST | `/api/v1/auth/logout` | Yes | — | Cleared cookies |
| GET | `/api/v1/auth/me` | Yes | — | Current user |

### Users
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/users/me` | Yes | — | User profile |
| PUT | `/api/v1/users/me` | Yes | `{ name, phone, city, avatar, preferences }` | Updated user |

### Sellers (Public)
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/sellers` | No | Query: category, city, area, page | Seller list |
| GET | `/api/v1/sellers/:slug` | No | — | Full seller profile |
| GET | `/api/v1/sellers/:id/services` | No | — | Services list |

### Sellers (Protected)
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/sellers` | Yes | Seller profile data | Created profile |
| PUT | `/api/v1/sellers/:id` | Yes | Partial update | Updated profile |
| GET | `/api/v1/sellers/dashboard` | Yes | — | Dashboard stats |

### Services, Menu, Packages, Gallery
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/services` | Yes | Service data | Created service |
| PUT | `/api/v1/services/:id` | Yes | Partial update | Updated service |
| DELETE | `/api/v1/services/:id` | Yes | — | Soft delete |
| POST | `/api/v1/menu-categories` | Yes | `{ name }` | Created category |
| POST | `/api/v1/menu-items` | Yes | Menu item data | Created item |
| POST | `/api/v1/packages` | Yes | Package data | Created package |
| POST | `/api/v1/gallery-images` | Yes | FormData (image) | Uploaded image |

### Search
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/search` | No | Query: q, category, city, minPrice, maxPrice, rating, sortBy, page | Search results |

### Booking Requests
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/booking-requests` | Yes | `{ sellerId, eventType, eventDate, guestCount, ... }` | Created request |
| GET | `/api/v1/booking-requests` | Yes | Query: status, page | Request list |
| GET | `/api/v1/booking-requests/:id` | Yes | — | Single request |
| PUT | `/api/v1/booking-requests/:id/status` | Yes | `{ status, sellerResponse?, alternativeDate? }` | Updated request |

### Estimates
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/estimates` | Yes | `{ bookingRequestId, lineItems[], discountPercent, ... }` | Created estimate |
| GET | `/api/v1/estimates` | Yes | Query: bookingRequestId | Estimate list |
| POST | `/api/v1/estimates/:id/accept` | Yes | — | Accepted estimate |
| POST | `/api/v1/estimates/:id/reject` | Yes | — | Rejected estimate |

### Bookings
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/bookings` | Yes | Query: status, page | Booking list |
| POST | `/api/v1/bookings/:id/confirm-deposit` | Yes | `{ method, reference? }` | Confirmed booking |

### Availability
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/availability/:sellerId` | No | Query: month, year | Calendar grid |
| POST | `/api/v1/availability/:sellerId` | Yes | `{ date, status, note? }` | Updated availability |

### Messages
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/messages/:bookingRequestId` | Yes | Query: page | Message thread |
| POST | `/api/v1/messages` | Yes | `{ bookingRequestId, content, type?, imageUrl? }` | Created message |

### Notifications
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/notifications` | Yes | Query: unreadOnly, page | Notification list |
| PUT | `/api/v1/notifications/:id/read` | Yes | — | Marked read |
| PUT | `/api/v1/notifications/read-all` | Yes | — | All marked read |

### Reviews
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/reviews` | Yes | `{ bookingId, overallRating, subRatings, text, photos? }` | Created review |
| GET | `/api/v1/reviews` | No | Query: sellerId, page | Review list |
| POST | `/api/v1/reviews/:id/reply` | Yes | `{ text }` | Seller reply |
| POST | `/api/v1/reviews/:id/flag` | Yes | `{ reason }` | Flagged review |

### Favorites
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/favorites` | Yes | `{ type, sellerId? / feedPostId? }` | Created favorite |
| GET | `/api/v1/favorites` | Yes | Query: type | Favorite list |
| DELETE | `/api/v1/favorites/:id` | Yes | — | Deleted favorite |

### Feed Posts
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/api/v1/feed-posts` | No | Query: sellerId?, page | Post list |
| POST | `/api/v1/feed-posts` | Yes | `{ mediaUrl, caption?, taggedServiceId? }` | Created post |
| DELETE | `/api/v1/feed-posts/:id` | Yes | — | Deleted post |

### Support Payments
| Method | Endpoint | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/v1/support-payments/checkout` | No | `{ amount, message? }` | Safepay URL |
| POST | `/api/v1/support-payments/webhook` | No | Safepay payload | 200 OK |

### Admin
| Method | Endpoint | Auth | Role | Body | Response |
|---|---|---|---|---|---|
| GET | `/api/v1/admin/stats` | Yes | admin | — | Platform stats |
| GET | `/api/v1/admin/sellers` | Yes | admin | Query: status | Seller list |
| GET | `/api/v1/admin/sellers/:id` | Yes | admin | — | Seller detail |
| PUT | `/api/v1/admin/sellers/:id/approve` | Yes | admin | — | Approved |
| PUT | `/api/v1/admin/sellers/:id/reject` | Yes | admin | `{ reason }` | Rejected |
| GET | `/api/v1/admin/users` | Yes | admin | Query: page | User list |
| GET | `/api/v1/admin/bookings` | Yes | admin | Query: page | Booking list |
| GET | `/api/v1/admin/reviews-reports` | Yes | admin | Query: status | Reports list |
| PUT | `/api/v1/admin/reviews/:id/remove` | Yes | admin | — | Removed |
| PUT | `/api/v1/admin/reports/:id/resolve` | Yes | admin | `{ resolution }` | Resolved |

---

## 16. Appendix B: Component Inventory

### Layout Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `Header` | `components/layout/` | All public pages | Auth state, notification count |
| `Footer` | `components/layout/` | All public pages | — |
| `Shell` | `components/layout/` | All pages | — |
| `Sidebar` | `components/layout/` | Dashboard layouts | User role, nav items |
| `MobileNav` | `components/layout/` | All pages (mobile) | User role |

### Search Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `SearchBar` | `components/search/` | Home, Explore | Categories, cities |
| `FilterPanel` | `components/search/` | Explore | Category filters config |
| `ResultCard` | `components/search/` | Explore, Featured | Seller summary |
| `MapView` | `components/search/` | Explore | Seller coordinates |
| `SortDropdown` | `components/search/` | Explore | — |

### Seller Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `SellerHeader` | `components/seller/` | Seller profile | Seller profile |
| `GalleryGrid` | `components/seller/` | Seller profile | Gallery images |
| `ServiceList` | `components/seller/` | Seller profile | Services, packages |
| `MenuSection` | `components/seller/` | Seller profile (catering) | Menu categories, items |
| `CalendarWidget` | `components/seller/` | Seller profile | Availability grid |
| `ReviewList` | `components/seller/` | Seller profile | Reviews |
| `RequestBookingPanel` | `components/seller/` | Seller profile | Auth state |

### Booking Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `ChatThread` | `components/booking/` | Message pages | Messages, estimates |
| `EstimateCard` | `components/booking/` | Chat thread | Estimate data |
| `BookingSummaryCard` | `components/booking/` | Chat thread | Booking data |
| `LedgerPanel` | `components/booking/` | Chat thread | Ledger entries |

### Dashboard Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `StatCard` | `components/dashboard/` | All dashboards | Stat value, label, trend |
| `RequestList` | `components/dashboard/` | Customer, Seller | Booking requests |
| `EventPlanner` | `components/events/` | Events page | Event data |
| `SellerCalendar` | `components/calendar/` | Seller calendar | Availability grid |
| `EstimateBuilder` | `components/estimates/` | Estimate builder | Services/menu items |
| `AnalyticsChart` | `components/analytics/` | Seller analytics | Time-series data |

### Shared Components
| Component | Location | Used By | Data Needs |
|---|---|---|---|
| `StarRating` | `components/shared/` | Reviews, cards | Rating value |
| `VerifiedBadge` | `components/shared/` | Seller cards, profile | Verification status |
| `PriceDisplay` | `components/shared/` | Cards, estimates | Price, currency |
| `StatusPill` | `components/shared/` | Lists, calendar | Status string |
| `SkeletonCard` | `components/shared/` | All list pages | — |
| `EmptyState` | `components/shared/` | All list pages | Message, action |

---

## 17. Appendix C: Environment Variables Template

### `frontend/.env.local`
```bash
VITE_SITE_URL=https://dreamevents.com
VITE_API_URL=https://api.dreamevents.com
VITE_MAPTILER_API_KEY=your_maptiler_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://dreamevents.com
COOKIE_DOMAIN=.dreamevents.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dreamevents?retryWrites=true&w=majority

# JWT
JWT_SECRET=min-32-char-random-string-here
JWT_REFRESH_SECRET=another-32-char-random-string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Safepay
SAFEPAY_API_KEY=your_safepay_key
SAFEPAY_SECRET_KEY=your_safepay_secret
SAFEPAY_WEBHOOK_SECRET=your_webhook_secret
SAFEPAY_ENV=sandbox

# Email (Resend)
RESEND_API_KEY=your_resend_key
EMAIL_FROM_ADDRESS=noreply@dreamevents.com
EMAIL_FROM_NAME=DreamEvents

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# Admin
ADMIN_EMAIL=admin@dreamevents.com
ADMIN_PASSWORD=secure-admin-password
18. Appendix D: Seed Data Guidelines
Categories (V1)
Venue — subcategories: Marriage Hall, Banquet Hall, Farmhouse, Restaurant Event Space
Catering — subcategories: Full-Service, Home-Chef Scale, Buffet, Plated
Photography — subcategories: Wedding Photographer, Videographer, Drone Operator
Decoration — subcategories: Floral, Stage, Lighting, Entrance, Theme-Based, Corporate
Cities (V1)
Sukkur — areas: Sadar, Military Road, Barrage Colony, Shalimar, Minara Road, New Sukkur, Rohri Road
Demo Sellers (8-12 total)
Create realistic Pakistani business names across all categories:
Venues: Al-Noor Marriage Hall, Royal Banquet Sukkur, Green Farmhouse Events
Catering: Sukkur Catering Services, Biryani House Events, Sweet Palace Caterers
Photography: Lens Studio Sukkur, Wedding Tales Photography, DroneEye PK
Decoration: Floral Dreams Decor, Royal Stage Designers, Light & Theme Events
Each seller needs:
Complete profile with cover image, logo, description
3-5 services with realistic pricing in PKR
5-8 gallery images
Business hours, policies, social links
Demo Bookings & Reviews
Create 1-2 completed bookings with verified reviews so the homepage testimonials section has real data on first deploy.
19. Appendix E: State Machine Quick Reference
BookingRequest
plain
pending → seller_replied → estimate_sent → negotiating ↔ estimate_sent
  ↓
  accepted → [deposit confirmed] → Booking
  ↓
  expired (48h timeout)
pending → rejected (seller decline)
pending/negotiating → cancelled (either party)
Estimate
plain
draft → sent → viewed → accepted
  ↓
  rejected / superseded
Availability
plain
available ↔ blocked (manual)
available → pending (accepted estimate)
pending → booked (deposit confirmed)
pending → available (hold expired)
booked → available (booking cancelled)
SellerProfile
plain
pending → approved / rejected
rejected → pending (resubmitted)
approved ↔ suspended
20. Document Change Log
Table
Version	Date	Changes
1.0	2026-08-16	Initial release. 8 build phases, 200+ files, complete API inventory, deployment runbook, risk register, and appendices. Aligned with PRD v1.0, TRD v1.0, App Flow v1.0, UI/UX Brief v1.0, Backend Schema v1.0.
End of Implementation Plan
plain

---

## Summary

I've created **06-Implementation-Plan.md** as a comprehensive, executable runbook that completes your 6-document handoff set. Here's what it contains:

**8 Build Phases** (27 days total):
- **Phase 0:** Project bootstrap (monorepo, tooling, design tokens)
- **Phase 1:** Backend foundation — auth, users, sellers, catalog, search (3 days)
- **Phase 2:** Backend core — booking engine, estimates, messages, notifications, reviews (4 days)
- **Phase 3:** Frontend foundation — design system, auth context, layouts (2 days)
- **Phase 4:** Public pages — home, explore, seller profiles, SEO (3 days)
- **Phase 5:** Customer dashboard — events, requests, chat, favorites (3 days)
- **Phase 6:** Seller dashboard — onboarding, calendar, estimate builder, analytics (4 days)
- **Phase 7:** Admin panel — approvals, moderation, content management (2 days)
- **Phase 8:** Platform polish — payments, SEO, email, cron jobs, error handling (3 days)

**Key deliverables for AI agent usage:**
- **File-by-file build order** with exact paths and dependencies
- **Phase checkpoints** — clear "done" criteria before moving on
- **Complete API endpoint inventory** — 50+ endpoints with auth/role requirements
- **Component inventory** — every major UI component mapped to data needs
- **Testing strategy** — unit, integration, database, and E2E test cases
- **Deployment runbook** — step-by-step Netlify/Vercel + Northflank + Atlas deploy
- **Risk register** — 9 identified risks with mitigations
- **5 appendices** — API reference, component map, env vars, seed data, state machines

This document is designed to be fed into **opencode/DeepSeek API via terminal** as the master execution script, with the other 5 documents serving as the detailed specifications it references at every decision point.