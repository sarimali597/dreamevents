# DreamEvents — Deployment & Operations Guide

> Single source of truth for running, deploying, and operating the DreamEvents marketplace.
> Stack: **React 19 (Vite, plain JS) frontend** + **Express 5 / MongoDB (Mongoose) / Socket.IO backend** (pnpm workspace).

---

## 1. Project layout

```
dreamevents/
├── frontend/            # React 19 + Vite SPA (deploys to Vercel)
│   ├── src/
│   ├── vite.config.js
│   ├── vercel.json      # SPA rewrite -> index.html
│   └── .env.production  # VITE_API_URL (prod API base)
├── backend/             # Express 5 API (deploys to Render)
│   ├── server.js
│   ├── src/
│   └── render.yaml      # Render web service blueprint
├── prompt_files/        # Authoritative V1 specs (PRD/TRD/schema/etc.)
├── homeimages/ imagesrelatedtoevents/ sampleimages/  # staged asset folders
├── pnpm-workspace.yaml
└── package.json         # workspace root (turbo)
```

**Important:** `eventconnect1.md` / `eventconnect2.md` in the repo root are Sarim's OLDER vision docs (escrow/payments/commission). They are **not** authoritative — the 6 files in `prompt_files/` are. V1 = 4 categories (Venues/Catering/Photography/Decoration), Sukkur only, NO escrow/payments-gating.

---

## 2. Local development

### Prerequisites
- Node >= 22
- pnpm (`npm i -g pnpm` or use the repo's `packageManager` pin)
- A running MongoDB instance (local or Atlas)

### Backend
```bash
cd backend
cp .env.example .env        # then fill values (see §4)
pnpm install
pnpm dev                    # node --watch server.js  (port 4000)
```
API base: `http://localhost:4000/api/v1`
Health: `http://localhost:4000/api/v1/health`

### Frontend
```bash
cd frontend
cp .env.example .env.local  # VITE_API_URL=http://localhost:4000/api/v1
pnpm install
pnpm dev                    # Vite dev server on :3000 (also works on :3100 if reconfigured)
```
Open `http://localhost:3000`.

### Seed demo data (optional)
```bash
cd backend
pnpm seed                   # creates demo sellers/admin
```

### Demo accounts
- **Admin:** `admin@dreamevents.com` / [REDACTED — set your own in .env]
- **Seller:** `alnoor@seller.demo` / [REDACTED — set your own in .env]
> Never commit real secrets. `.env`, `.env.local`, `githubdetails.txt`, `cloudinary.txt`, `mongouri.txt` are git-ignored.

---

## 3. Build (verification command)

From `frontend/`:
```bash
NODE_OPTIONS=--max-old-space-size=2048 CI=1 pnpm run build
```
> The build is RAM-sensitive on low-memory machines. If `vite build` crashes (exit 127/134 / "memory allocation failed"), re-run with the `NODE_OPTIONS` above. The crash is transient low-RAM, **not** a code defect.

Dev-server / HMR transform check (no full build):
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/src/routes/public/SellerProfile.jsx
```

---

## 4. Environment variables

### Backend (`backend/.env`)
| Var | Required | Notes |
|-----|----------|-------|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | random, >= 32 chars |
| `JWT_REFRESH_SECRET` | yes | random, >= 32 chars |
| `FRONTEND_URL` | yes (prod) | `https://dream-events.vercel.app` |
| `FRONTEND_URLS` | optional | comma-separated extra origins |
| `PORT` | no | default 4000 |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | for uploads | image upload to Cloudinary |
| `RESEND_API_KEY` | optional | transactional email |
| `SAFEPAY_*` | optional | "Buy Us a Coffee" donations |

CORS reflects any origin in dev; in prod it allowlists `FRONTEND_URL` / `FRONTEND_URLS`.

### Frontend
- `VITE_API_URL` — API base. Dev default `http://localhost:4000/api/v1`.
- Production value lives in `frontend/.env.production` AND should also be set in the Vercel dashboard:
  `https://dreamevents-backend.onrender.com/api/v1`
  > `VITE_API_URL` is inlined at **build time**. After the backend URL is known, confirm this matches, then **redeploy Vercel**.

---

## 5. Deploy — Backend (Render)

1. https://dashboard.render.com → **New → Blueprint** (or New Web Service).
2. Connect GitHub repo `sarimali597/dreamevents`.
3. Blueprint mode picks up `backend/render.yaml` automatically. Manual mode:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Node 22, free tier, region oregon.
4. Set **Environment Variables** (the yaml marks these `sync: false` → you must enter them in Render):
   `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_*`, `RESEND_API_KEY`, `FRONTEND_URL` (= `https://dream-events.vercel.app`), `FRONTEND_URLS` (= same).
5. Deploy. Expected URL: `https://dreamevents-backend.onrender.com`
   - If Render assigns a **different** subdomain, update `VITE_API_URL` in `frontend/.env.production` + the CORS allowlist in `backend/render.yaml`, commit, and redeploy both.
6. Verify: `https://<your-backend>/api/v1/health` returns `{ "status": "ok" }`.

---

## 6. Deploy — Frontend (Vercel)

1. https://vercel.com → **New Project** → import `sarimali597/dreamevents`.
2. Framework: **Vite**. Root Directory: `frontend`.
3. Build Command: `vite build` · Output Directory: `dist` (auto-detected).
4. Add Environment Variable: `VITE_API_URL = https://dreamevents-backend.onrender.com/api/v1`.
5. Deploy → live at **`https://dream-events.vercel.app`**.
6. `frontend/vercel.json` rewrites all routes to `index.html` so deep links (`/seller/:slug`, `/login`, `/feed`) survive refresh.

---

## 7. End-to-end smoke test (after both deployed)

- [ ] `https://dream-events.vercel.app` loads homepage.
- [ ] Browse a seller: `https://dream-events.vercel.app/seller/<slug>` — cover banner contained, profile info below it, **Request quote** works (redirects to login if logged out; opens modal if customer).
- [ ] Login as customer → request a quote → success toast.
- [ ] Seller/Admin login works; admin approve flow at `/admin`.
- [ ] Image upload (seller cover/logo/gallery) reaches Cloudinary.

---

## 8. Known constraints & conventions

- **V1 scope:** 4 categories, Sukkur only, no escrow/payments-gating (ledger-based; seller marks deposit received). "Buy Us a Coffee" (Safepay) is the only monetization.
- **Design tokens:** Baltic Blue `#306998`, Gold `#ffd43b`, Indigo `#1a1a2e`; Fraunces + Geist. Tailwind v4 tokens emitted as `--color-*`; gradients via `@utility` in `frontend/src/styles/globals.css`. No hardcoded dark-only hex.
- **UI must be responsive:** sidebar→drawer < 1024px, tables in `overflow-x-auto`, grids step `sm/md/lg/xl`.
- **Build RAM note (§3):** use `NODE_OPTIONS=--max-old-space-size=2048`.
- **No TypeScript, no Next.js** (Next was intentionally removed).

---

## 9. Git / repo hygiene

- Default branch on GitHub: `main` (force-synced from `master`).
- Seeded/ignored: `node_modules/`, `dist/`, `.env`, `.env.local`, `githubdetails.txt`, `cloudinary.txt`, `mongouri.txt`, `_removed-nextjs-files/`, `mapdetails.txt`.
- Dead code (`_removed-nextjs-files/`) and the redundant `mapdetails.txt` were removed from the repo.
- **Security:** after any push, rotate GitHub password + revoke the deploy token; delete local secret `.txt` files.

---

## 10. Recent fixes (for context)

- **Seller profile cover overflow:** root cause was the profile header row pulling text up onto the cover via `-mt-16`. Fixed by moving the negative margin to the avatar only and adding `z-0 isolate` (hero) / `z-10` (content) layering. No-photo sellers now get a branded gradient banner instead of a stretched random image.
- **Request quote button:** was `disabled={!canBook}` (dead for non-customers). Now redirects logged-out users to login, opens modal for customers, only disabled for sellers.
- **Navbar / About:** "Location" is an icon-only pill scrolling to the homepage `#location` map section; About merged into the homepage (separate `/about` route removed).
- **Cover fallback:** when a seller has no `coverImage`/`logo`, `cover` is `null` → clean gradient hero (no stretched photo).
