# DreamEvents — App Flow Document

**Version 1.0 · Maps every screen and the exact path a user takes through them · V1 scope**

---

## 1. Sitemap

```
PUBLIC (no login required)
├── / ......................................... Home
├── /explore ................................... Search & filter (list + map)
├── /venues/sukkur ............................. Venue category landing (SEO)
├── /catering/sukkur ........................... Catering category landing (SEO)
├── /photography/sukkur ........................ Photography category landing (SEO)
├── /decoration/sukkur ......................... Decoration category landing (SEO)
├── /seller/[slug] ............................. Seller storefront / profile
├── /service/[serviceId] ....................... Individual service detail
├── /feed ....................................... Inspiration feed
├── /about
├── /contact
├── /faq
├── /sign-up
├── /login
├── /404 (not-found)
└── /error

CUSTOMER (auth required, role = customer)
├── /dashboard
├── /events ..................................... My Events list
│  └── /events/[id] .......................... Single event plan
├── /requests ................................... Booking requests sent
├── /estimates ................................... Estimates received
├── /favorites
├── /messages
│  └── /messages/[bookingRequestId] .......... Conversation thread
├── /notifications
├── /reviews ..................................... Reviews I've left
└── /settings

SELLER (auth required, role = seller)
├── /seller-dashboard/onboarding ................ 6-step wizard (first login only)
├── /seller-dashboard ............................ Dashboard home
├── /seller-dashboard/profile
├── /seller-dashboard/services
├── /seller-dashboard/menu ....................... Catering sellers only
├── /seller-dashboard/packages
├── /seller-dashboard/calendar
├── /seller-dashboard/requests
├── /seller-dashboard/estimates/new/[requestId] .. Estimate builder
├── /seller-dashboard/messages
│  └── /seller-dashboard/messages/[bookingRequestId]
├── /seller-dashboard/gallery
├── /seller-dashboard/feed-posts
├── /seller-dashboard/reviews
├── /seller-dashboard/analytics
├── /seller-dashboard/payments ................... Fee history + ledger view
└── /seller-dashboard/settings

ADMIN (auth required, role = admin)
├── /admin ........................................ Dashboard
├── /admin/sellers ................................ Approval queue + management
│  └── /admin/sellers/[id] ..................... Application review detail
├── /admin/users
├── /admin/categories
├── /admin/cities
├── /admin/bookings ............................... Read-only oversight
├── /admin/reviews-reports
├── /admin/homepage-content
└── /admin/analytics
```

---

## 2. Primary Flow: Guest -> First Booking Request

This is the flow the whole product is built around. Every screen below maps to a route above.

1. **Guest lands on Home** (`/`) — either organically, via search engine, or a shared seller link.
2. Guest uses the hero search bar (category, city defaults to Sukkur, optional date/guest count) -> lands on **`/explore`** with those filters pre-applied.
3. Guest narrows using category-specific filters (Section 6.1 of the PRD) and switches between list/map view.
4. Guest opens a result -> **`/seller/[slug]`**. Browses gallery, services/menu, reviews, availability calendar, policies.
5. Guest tries to tap **Request Booking** -> blocked, redirected to **`/sign-up`** with a "continue where you left off" return path (the intended action — which seller/date — is preserved through the auth redirect, not lost).
6. Guest completes sign-up (email/password, phone+OTP, or Google) selecting role = **Customer**.
7. On successful signup, redirected straight back to `/seller/[slug]` with the booking request panel already open — the flow they started isn't repeated from scratch.
8. Customer fills the **Booking Request form**: event type, date, time window, guest count, budget range, special requirements, message. The date picker disables any date the seller has marked Booked (Section 5 of this document).
9. Submit creates a `BookingRequest` document (status: `pending`) and a linked conversation thread. Customer is redirected to `/messages/[bookingRequestId]`, which is now the home base for everything that happens next with this seller.
10. Seller receives an in-app notification + email. Continue to Section 3.

---

## 3. Flow: Seller Responds -> Negotiation -> Acceptance

1. Seller opens `/seller-dashboard/requests`, sees the new request (status: `pending`), opens it.
2. Seller chooses one of: **Accept & build estimate**, **Ask for more details** (sends a message, status stays `pending`), **Offer an alternative date**, or **Decline** (status -> `rejected`, thread closed for new requests but remains readable).
3. On **Accept & build estimate**, seller is taken to `/seller-dashboard/estimates/new/[requestId]` — the **Estimate Builder**.
  - For a Venue: selects service/package, adjusts price if custom, adds discount/service charge/tax.
  - For Catering: picks items from their published menu; running total calculates live as items and guest count are set (PRD 6.3, TRD 5.4).
  - For Photography: selects package, add-ons (drone, extra hours, album), number of photographers.
  - For Decoration: selects theme/style, area size, inclusions.
4. Seller sends the estimate. `Estimate` document created (status: `sent`), `BookingRequest.status` -> `estimate_sent`. It appears in the shared thread as a **structured card**, not plain text.
5. Customer opens `/messages/[bookingRequestId]`, sees the card (status flips to `viewed`). Customer can:
  - **Accept** -> go to Section 4 (Confirmation).
  - **Reject** -> `BookingRequest.status` -> `rejected`.
  - **Message a counter-request** (e.g. "any discount for 250 guests?") -> this is the negotiation loop.
6. On a counter-request, `BookingRequest.status` -> `negotiating`. Seller sends a **revised estimate**: a new `Estimate` document (version incremented), previous one marked `superseded`. Both remain visible in the thread history so nothing gets lost.
7. Steps 5-6 repeat until the customer either accepts or the conversation stalls (see Section 5, expiry rules).

---

## 4. Flow: Acceptance -> Hold -> Direct Deposit -> Confirmed

No platform payment appears anywhere in this flow — DreamEvents is not involved in the money changing hands between customer and seller (PRD 6.5, TRD 6). The whole flow runs on one honest human action: the seller confirming they've been paid.

1. Customer taps **Accept** on an estimate. `Estimate.status` -> `accepted`, `BookingRequest.status` -> `accepted`.
2. The system immediately writes an `Availability` document for that seller/date with status `pending` (visually: **yellow**, "Hold") — this happens automatically, the seller does not need to touch their calendar. The date is no longer requestable by anyone else while the Hold is active.
3. The accepted estimate already states the deposit amount. Customer and seller settle it directly — bank transfer, JazzCash, Easypaisa, or cash — entirely outside the app.
4. Customer optionally marks "I've sent the deposit" in the shared **ledger** (method + reference note + timestamp) — useful for their own record, but nothing in the system depends on this step alone.
5. **Seller marks "Deposit received."** This single action is what actually confirms the booking: it creates the `Booking` document (status: `confirmed`) and flips the `Availability` document to `booked` (**red**) — a **hard block**. This is a direct call to the backend's `booking.confirmDeposit()` endpoint, not gated by any webhook or payment provider — the booking is confirmed the moment the person who actually received the money says so.
6. Customer's linked **Event** (if the booking request was created from `/events/[id]`) rolls its status to `partially_booked` or `fully_booked` depending on how many service categories are covered.
7. If the seller does **not** mark the deposit received within 48 hours of acceptance, the backend's hourly scheduled job releases the Hold: `Availability` reverts to `available`, `BookingRequest.status` -> `expired`. This protects the seller's own calendar from being blocked indefinitely by a deal that stalled — and gives the seller a direct incentive to keep the ledger current, since it's their availability at stake.

---

## 5. State Machines

### 5.1 Booking Request status

```
pending -> seller_replied -> estimate_sent -> negotiating <-> estimate_sent
  |
  (customer accepts)
  v
  accepted -> (seller confirms deposit received) -> [becomes a Booking, see 5.3]
  |
  (48h, seller hasn't confirmed)
  v
  expired

pending -> rejected (seller declines)
pending/negotiating -> cancelled (either party, before acceptance)
```

### 5.2 Estimate status

```
draft -> sent -> viewed -> accepted
  |
  |-> rejected
  |-> (counter-request) -> superseded (a new estimate version is sent)

sent/viewed -> expired (validity date passed without action)
```

### 5.3 Booking status (post-acceptance)

```
confirmed -> completed (auto, once event_date has passed)
confirmed -> cancelled_by_customer
confirmed -> cancelled_by_seller
confirmed -> disputed (either party raises an issue; admin visibility)
```

`completed` is the single gate that unlocks review creation (PRD 6.6) — enforced server-side, not just hidden in the UI.

### 5.4 Availability status (per seller, per date)

```
available <-> blocked  (seller's own manual toggle, any time)
available -> pending  (a booking request is accepted, Hold created)
pending -> booked  (seller confirms deposit received)
pending -> available  (Hold expires after 48h with no seller confirmation)
booked -> available  (booking cancelled — refund/policy handling is a business rule, not detailed here)
```

### 5.5 Seller account status

```
pending (submitted onboarding, awaiting review)
  -> approved (visible in search, can receive requests)
  -> rejected (admin provides a reason; seller can revise and resubmit)
approved -> suspended (admin action, e.g. policy violation or dispute)
suspended -> approved (reinstated)
```

---

## 6. Flow: Seller Onboarding -> Live Listing

1. New seller completes `/sign-up` with role = **Seller**.
2. Redirected into `/seller-dashboard/onboarding`, a 6-step wizard. Each step saves on "Next" (a seller who abandons at step 3 can return later and resume at step 3, not step 1):
  - **Step 1 — Business info:** name, category (Venue/Catering/Photography/Decoration), subcategory, city (defaults Sukkur), area, address, description, contact.
  - **Step 2 — Visuals:** logo, cover image, gallery images (Cloudinary upload widget).
  - **Step 3 — Services/Menu:** at least one service or, for Catering, at least one menu category with items — the wizard doesn't let a seller finish with an empty storefront.
  - **Step 4 — Availability:** working days/hours, initial blocked dates, booking notice period.
  - **Step 5 — Social links:** Instagram/Facebook/YouTube/WhatsApp (all optional).
  - **Step 6 — Submit for approval:** review summary screen, upload verification documents (CNIC, business registration — routed to a private folder in Cloudinary, not the public gallery), submit.
3. `SellerProfile.status` -> `pending`. Seller sees a "Your profile is under review" state if they visit their dashboard before approval — they can still edit everything, just can't go live.
4. Admin reviews in `/admin/sellers/[id]`: sees all submitted info + documents, approves or rejects with a reason.
5. On **approve**: `SellerProfile.status` -> `approved`, the profile becomes visible in `/explore` and search index, and the seller gets a notification + email ("You're live").
6. On **reject**: seller gets a notification with the reason, can edit and resubmit (back to step 6 of the wizard, not the whole flow).
7. From here on, the seller's day-to-day loop is: check `/seller-dashboard/requests` -> respond -> build estimates -> manage calendar -> get paid (platform fee is triggered by the customer, not the seller) -> collect reviews.

---

## 7. Flow: Review Loop

1. `Booking.status` flips to `completed` automatically (the backend's daily scheduled job, Implementation Plan M7) once `eventDate` has passed and the booking wasn't cancelled/disputed.
2. Customer gets a notification: "How was [Seller]? Leave a review."
3. Customer opens the review form (reachable from the notification, the booking's entry in `/events/[id]`, or `/reviews`): overall rating + four sub-ratings (service quality, price fairness, communication, timeliness) + written text + optional photos.
4. Review is published immediately (marked verified by virtue of being tied to a `completed` booking — no separate manual verification step needed) and appears on the seller's profile and in `/seller-dashboard/reviews`.
5. Seller can post one public reply per review.
6. Any user (or the seller, for their own reviews) can flag a review for admin attention -> appears in `/admin/reviews-reports`; admin can remove.

---

## 8. Flow: Admin Moderation & Oversight (summary)

- **Seller approval queue** (`/admin/sellers`) — the highest-frequency admin task at launch; filterable by pending/approved/rejected/suspended.
- **Reports queue** (`/admin/reviews-reports`) — user-submitted reports (fake seller, inappropriate content, review disputes) triaged by an admin, resolved with a logged action (`admin_activity_log`).
- **Booking oversight** (`/admin/bookings`) — read-only, used for support (a customer or seller emails asking about a specific booking) rather than active management.
- **Category/city management** — low-frequency, mostly a one-time setup at launch (seed four categories, seed Sukkur + areas within it), but built as editable admin screens from day one specifically so Phase 2 (new categories, new cities) doesn't require a code deploy.

---

## 9. Cross-Cutting Flow Notes

- **Compare tool:** from `/explore` results or `/favorites`, a customer can select up to 3 same-category sellers -> a comparison view (not a separate route necessarily — can be a modal/drawer) showing price, rating, capacity, key inclusions, review count side by side.
- **Favorites:** a single heart/save action available on any seller card or profile, from anywhere in the public site, gated behind login (guest tapping it triggers the same sign-up redirect pattern as Section 2, step 5).
- **"Buy Us a Coffee" (standalone, not gated to any other flow):** entry points in the footer, About page, and a soft one-time prompt on the customer's booking-confirmation screen. Tapping it opens a small amount picker (presets + custom, optional message) -> Safepay checkout -> thank-you confirmation. No account required to give; if logged in, `user_id` is attached for the customer's own record, but this never intersects the booking state machine in Sections 3-5.
- **Notifications:** every state transition described above that's relevant to a *human* (not just an internal system flag) writes a `Notification` document and, for the higher-value ones, triggers an email — the specific list is enumerated in PRD Section 6.7, not repeated per-flow here.
- **Empty states are part of the flow, not an afterthought:** a new seller's `/seller-dashboard` before they've received any requests, a customer's `/favorites` before they've saved anything, `/explore` returning zero results for an overly narrow filter set — each needs a designed state (UI/UX Design Brief, Section 9), not a blank screen.
- **Custom 404 page:** `frontend/src/routes/NotFound.jsx` (route `*`) — on-brand dark indigo background, animated illustration (Lottie or CSS), search bar, links to popular categories and featured sellers. Never a dead end.
- **Error boundary:** `frontend/src/routes/Error.jsx` — friendly tone, plain-language explanation, one clear recovery action (retry or go home), dark mode compatible.