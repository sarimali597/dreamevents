# DreamEvents — Product Requirements Document (PRD)

**Version 1.0 · V1 Build Scope · Prepared for AI coding agent handoff (opencode terminal / DeepSeek API)**

---

## How to Read This Document

This PRD defines **what to build for V1** — a real, launchable product, not a demo. Your original vision describes a much larger multi-category, multi-city, AI-powered marketplace. That full vision is preserved and referenced throughout as the **Roadmap**, but every feature marked **V1** in this document is what the six handoff documents actually specify in buildable detail. Section 3 explains exactly why the scope was cut this way and what was deliberately left out.

Companion documents: `02-Technical-Requirements-Document.md`, `03-App-Flow-Document.md`, `04-UIUX-Design-Brief.md`, `05-Backend-Schema-Document.md`, `06-Implementation-Plan.md`.

---

## 1. Executive Summary

**Product name:** DreamEvents
**One-line description:** A trust-first marketplace that connects people planning weddings and events with verified venues, caterers, photographers, and decorators, replacing scattered phone calls and informal bargaining with structured search, transparent pricing, and in-app negotiation.

**Vision:** DreamEvents becomes the default starting point for event planning in Pakistan — the place you search for a marriage hall the way you'd search for a hotel, compare menus the way you'd compare flights, and negotiate a final price without fifteen WhatsApp threads and no paper trail.

**V1 focus:** Four categories (Venues, Catering, Photography, Decoration), one city (Sukkur), three roles (Customer, Seller, Admin), one core loop: **search → compare → request → negotiate → book → review.**

---

## 2. Problem Statement

Event planning in Pakistan today is fragmented and opaque:

- Finding a suitable venue means calling a dozen halls and asking the same questions repeatedly.
- Catering prices are quoted verbally, vary by who's asking, and are hard to compare across vendors.
- Real availability is unknown until you call — venues rarely publish live calendars.
- Bargaining happens informally over the phone with no written record of what was agreed.
- There's no reliable way to check whether a vendor is actually good before paying a deposit — reviews, if they exist at all, aren't verified.
- Vendors with excellent work have no professional online presence beyond an Instagram grid and a WhatsApp number.

DreamEvents solves this by giving both sides a shared, structured system: sellers get a real storefront, a calendar, and a lead pipeline; customers get comparable listings, transparent pricing, and a negotiation trail they can point back to.

---

## 3. Scope Definition — Read This Before Anything Else

### 3.1 Why V1 is scoped to 4 Categories, Sukkur only

Your source documents describe four vendor categories (Venues, Catering, Photography, Decoration), multiple cities, seven AI features, digital invitations, RSVP tracking, multi-language support, and a subscription/featured-listing monetization layer. That is a strong 12-month roadmap, not a first build. Reasons to cut scope, not ambition:

1. **A coding agent given all of it at once builds a shallow version of everything.** Booking logic, negotiation, and the calendar system are genuinely complex state machines — they need to be solid before more categories multiply the surface area.
2. **The categories share a booking shape (date + guest count + price).** Building these four well establishes the patterns future categories will reuse.
3. **A marketplace with no city focus is a worse product than one with a real city focus, not a bigger one.** This is worth stating plainly since it's a real fork, not just a build-order preference: if DreamEvents were open to "anyone in Pakistan or elsewhere" from day one with a handful of vendors scattered nationally, nearly every visitor's search would come back thin or empty — a wedding marketplace lives or dies on whether a search in *your* city returns enough real options to compare. Concentrating the same vendor-acquisition effort into one city instead gets to a genuinely useful, comparison-worthy catalog much faster, which is the actual product experience that makes people come back and makes vendors bother keeping their calendar current. This is the standard playbook for any two-sided local marketplace (Uber, DoorDash, Thumbtack all launched one city at a time for exactly this reason) and it holds regardless of which city is first — city size doesn't change the argument, only the pace of expansion afterward.

Your original roadmap scoped Phase 1 to a single city; Sukkur is your chosen launch city for it. This PRD formalizes that as the literal build target.

### 3.2 What "V1" means concretely

| In V1 | Deferred to Roadmap (Section 12) |
|---|---|
| Venue, Catering, Photography, Decoration categories | Additional categories (DJ, Makeup, Transport) |
| Sukkur only | Multi-city expansion (Karachi, Lahore, Islamabad) |
| Customer, Seller, Admin roles | — |
| Search, filters, map view | AI-powered natural-language search |
| Request-to-book + structured negotiation | AI chat assistant auto-replying for sellers |
| Manual estimate builder | AI-generated estimates / smart menu builder |
| Seller-managed availability calendar | Calendar sync with external calendars (Google Calendar) |
| Reviews (verified, post-event) | AI review sentiment monitoring |
| Inspiration feed (seller posts) | Full social features (comments, follows) |
| Favorites + basic Compare (up to 3 sellers) | Full inspiration boards with sub-collections |
| "Buy Us a Coffee" voluntary platform support (Safepay) | Commission/booking-fee monetization, in-app held-fund escrow (see Section 10) |
| Admin approval + moderation panel | Automated fraud detection, AI content moderation |
| — | Digital invitations, RSVP management |
| — | Multi-language (Urdu) interface |
| — | Seller subscription tiers, featured-listing purchases |
| — | Bundle booking (venue + catering as one package) |
| — | Virtual/360° tours |

Every table, screen, and flow in the other five documents is written against this V1 line. Where the schema needs to anticipate Phase 2 (e.g., a generic `categories` collection instead of a hardcoded venue/catering enum), that's called out explicitly in the Backend Schema Document — so this is a foundation you build on, not a foundation you'll need to tear up.

---

## 4. Target Users

### 4.1 Customer / Event Organizer
People planning weddings, mehndis, engagements, birthdays, corporate events, and family functions in Sukkur. Primarily mobile-first, comparison-driven, price-sensitive but trust-sensitive — they will pay more for a vendor with visible proof of quality.

### 4.2 Seller / Vendor (V1: four sub-types)
- **Venue owners** — marriage halls, banquet halls, farmhouses, restaurant event spaces.
- **Catering services** — full-service caterers, home-chef-scale caterers offering event menus.
- **Photographers** — wedding photographers, videographers, drone operators.
- **Decorators** — floral decoration, stage decoration, lighting, theme-based decor.

Sellers are typically not technical. Many currently rely on WhatsApp and a phone number as their entire "system." Onboarding must assume low digital literacy and reward the seller with visible value (a real profile page, real leads) within minutes of signing up.

### 4.3 Platform Admin
Internal team (initially Sarim, or a small ops team) responsible for approving sellers, moderating content, resolving disputes, and managing the Sukkur catalog of categories.

---

## 5. User Roles & Permissions

| Capability | Guest | Customer | Seller | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse homepage, search, view seller profiles |  |  |  |  |
| View galleries, reviews, starting prices |  |  |  |  |
| Sign up / log in |  | — | — | — |
| Save favorites, create inspiration saves |  |  | — | — |
| Create an Event plan |  |  | — | — |
| Send booking requests, chat, negotiate |  |  |  (respond) | — |
| Leave reviews |  |  (post-booking only) | — | — |
| Manage own seller profile, services, menus, calendar |  | — |  (own only) |  (any) |
| Approve/reject seller accounts |  |  |  |  |
| Moderate reviews, posts, reports |  |  |  |  |
| Manage categories, cities |  |  |  |  |
| View platform-wide analytics |  |  |  (own only) |  |

Enforcement detail (how each of these becomes middleware/auth policy) is in the Backend Schema Document, Section 6.

---

## 6. Feature Requirements by Module

Each module below states **V1 requirements** with acceptance-criteria-style bullets an agent can implement directly against.

### 6.1 Public Discovery

**Home page**
- Hero with headline, search bar (category + city + date + guest count), and CTA.
- Popular categories grid (Marriage Halls, Banquet Halls, Farmhouses, Catering Services, Photographers, Decorators — all surfaced as V1 subcategories).
- Featured sellers rail (admin-curated or algorithmic by rating × recency).
- Inspiration feed preview (latest 6–8 seller posts).
- "How It Works" 6-step explainer (Search → Compare → Check availability → Request → Negotiate → Confirm).
- Testimonials (from verified reviews).
- Seller acquisition CTA ("Are you a venue or caterer? List your business").
- Footer with link to `https://sarimfolio.vercel.app` as quiet attribution.

**Explore / Search page**
- Filters: category, subcategory, area within Sukkur, date, guest count, budget range, rating.
- Category-specific filters:
  - *Venue:* indoor/outdoor, parking, A/C, lawn, bridal room, generator backup, event types allowed, capacity.
  - *Catering:* cuisine type, veg/non-veg, live cooking, buffet vs. plated, per-plate vs. package pricing.
  - *Photography:* drone, album, same-day edit, number of photographers, video coverage.
  - *Decoration:* floral, stage, lighting, entrance, theme-based, corporate decor.
- Toggle between list view and map view (pins clustered, "search this area" on map drag — see TRD 5.5).
- Each result card: cover image, name, category, rating + review count, area, starting price, availability indicator for the searched date, save button.
- Sort: relevance, rating, price low–high, price high–low.
- Empty state with suggestion to broaden filters (not a dead end).

**Seller Profile / Storefront page**
- Cover section: cover image/video, business name, verified badge, rating, area, starting price, primary actions (Request Booking, Message, Save, Share).
- About section.
- Gallery (categorized: venue/food/decoration/photos, lightbox viewer).
- Services list (each with price, price type, capacity, inclusions, "Add to estimate").
- Packages (bundled offerings with fixed inclusions).
- Menu section (Catering only) — categorized items with price-per-unit, live running total as items are selected.
- Availability calendar (read-only for visitors) — shows available/booked/pending at a glance; booked dates are not selectable for requests.
- Reviews (verified only, with category sub-ratings and seller replies).
- Location (map pin, area, distance if location permission granted).
- Social links (Instagram, Facebook, YouTube, WhatsApp).
- Policies (cancellation, advance payment, extra charges).

**Categories & Cities pages** — SEO-oriented landing pages (`/venues/sukkur`, `/catering/sukkur`, `/photography/sukkur`, `/decoration/sukkur`) that double as filtered search entry points.

**Inspiration Feed page** — chronological/algorithmic feed of seller posts (image or video, caption, tagged service, like/save actions). Tapping a post opens the linked seller profile or service.

### 6.2 Customer Account

- **Sign up / Login:** email+password, phone+OTP, Google OAuth. Role selected at signup (Customer/Seller).
- **Dashboard:** upcoming events, saved vendors, open booking requests, estimates awaiting response, unread messages, recently viewed sellers.
- **My Events:** create named event plans (e.g. "My Wedding — Dec 20") with type, date, city, guest count, budget, notes, and linked bookings; status auto-rolls up from linked booking requests (Planning → Request Sent → Negotiating → Partially Booked → Fully Booked → Completed → Cancelled).
- **Booking Requests:** list with status, seller, service, date, guest count, message preview.
- **Estimates:** list of received estimates with accept / reject / request-changes actions.
- **Favorites:** saved sellers and posts.
- **Messages:** per-booking-request conversation thread.
- **Notifications:** in-app feed (see 6.7).
- **Reviews:** history of reviews left.
- **Profile Settings:** name, contact, city, password, notification preferences.

### 6.3 Booking, Estimates & Negotiation — the core loop

This is the most important module in the product. Full state machine is in the App Flow Document, Section 4; database shape is in the Backend Schema Document, Section 4.4–4.6. Functional requirements:

- Customer sends a **Booking Request** from a seller profile: event type, date, time window, guest count, budget range, special requirements, message. The system blocks requesting a date the seller has marked Booked.
- Seller sees the request in their dashboard and can: **Accept & send an estimate**, **ask for more details**, **offer an alternative date**, or **decline**.
- Seller builds a structured **Estimate** (not a free-text price): line items (service/menu items × quantity × unit price), discount, service charge, tax if applicable, final total, validity date. For Catering, selecting menu items from the seller's published menu auto-calculates the running total.
- Estimate is delivered into the shared conversation as a **structured card** — never as plain chat text — showing the breakdown and Accept / Request Changes actions.
- **Negotiation:** customer can message a counter-request ("can you do this for 250 guests at a lower rate?"); seller responds with a **revised estimate** (new version, previous one marked superseded, both visible in history). This can repeat.
- Chat supports text, image attachments, and the structured cards (booking summary, estimate, revised offer). Read receipts and typing indicators are V1-nice-to-have, not required for launch.
- **Acceptance:** when the customer accepts an estimate, the booking request moves to Accepted and the date is immediately soft-blocked on the seller's calendar (Hold) pending payment confirmation.
- **Confirmation:** the customer and seller settle the deposit directly between themselves (Section 6.5 — this is explicitly not the platform's concern). Once the **seller marks the deposit as received** in the shared ledger, the booking becomes Confirmed and the date hard-blocks. No platform payment gates this step — the seller's own confirmation is the trigger, which also keeps sellers motivated to update it promptly since it's their calendar accuracy on the line.
- Requests and Holds expire automatically if not acted on within a defined window (default: booking requests seller hasn't responded to in 48 hours are flagged; accepted-but-unpaid Holds release after 48 hours) — this protects sellers' calendars from being clogged by abandoned negotiations.

### 6.4 Availability & Calendar

- Sellers manage a calendar with four states per date: **Available (green)**, **Pending request (yellow)**, **Booked (red)**, **Blocked (gray, seller's own choice — e.g. maintenance, personal use)**.
- Marking a date Booked or Blocked immediately removes it from bookable dates on the public profile.
- Calendar is visible (read-only, states only — no customer names) to visitors on the seller profile so they can self-filter before requesting.
- Month view is the V1 requirement; week/day views are not required.
- When an accepted estimate creates a Hold, the calendar auto-updates without the seller manually touching it.

### 6.5 Payments & Money Flow — read this alongside TRD Section 11 and Section 10 below

**The core principle: DreamEvents never touches money that belongs to a vendor.** The deposit and balance for an actual booking are agreed inside the estimate/negotiation flow but paid **directly between customer and seller** — bank transfer, JazzCash, Easypaisa, or cash — entirely outside the platform's custody. This is a deliberate product decision, not a limitation: it keeps the platform out of the regulated business of moving other people's money (Section 10), and it's simpler to build and trust.

- The app provides a lightweight **ledger**, not a payment processor, for this: either party marks a payment as sent/received with an optional method + reference note and a timestamp, giving both sides something to point to if there's a dispute. Nothing here moves money — it's a shared record.
- The **seller marking a deposit "received"** is what confirms the booking and hard-blocks the calendar date (Section 6.3) — this ties the platform's only real state transition to an honest, low-friction human action instead of a payment integration.
- Seller's "Payments / Earnings" dashboard page is, accordingly, a ledger view (deposit/balance records against their bookings) — not a payout balance, since DreamEvents never holds vendor funds in V1.

**"Buy Us a Coffee" — the actual V1 monetization mechanic.** Rather than charging any fee inside the booking flow, DreamEvents offers a simple, optional way for customers to support the platform directly, unconnected to any specific booking:

- A low-key " Support DreamEvents" entry point in the site footer, the About page, and a soft one-time prompt after a booking is confirmed ("If DreamEvents helped you plan your event, consider buying us a coffee").
- Preset amounts (e.g., PKR 100 / 300 / 500) plus a custom amount, one-time payment via Safepay, no account or booking required to give — an optional message field ("thanks for helping me find my venue!") is a nice touch but not required.
- This is the platform's own money, collected for its own service — the cleanest possible position relative to Section 10's regulatory concern, since nothing is being held or routed on anyone else's behalf.
- It is explicitly a goodwill/support mechanic for V1, not a growth lever — don't expect it to carry the business. It exists so the product isn't earning literally nothing while the core loop (search → book → review) proves itself with real users. Real monetization (commission, subscriptions, featured listings) is a Roadmap decision once there's volume and, likely, a formal payment-aggregator relationship to support it properly.

### 6.6 Reviews

- A review can only be created against a **Completed** booking (`booking.status = completed`), which the system marks automatically once the event date has passed and the booking wasn't cancelled — this is what "verified review" means, and it's enforced at the database level, not just the UI.
- Review fields: overall rating (1–5), and sub-ratings for service quality, price fairness, communication, timeliness; written text; optional photos.
- Sellers can reply once per review (public, visible under the review).
- Users and admins can flag a review for moderation; admin can remove.

### 6.7 Notifications

In-app notification feed (bell icon) for: new booking request received (seller), request accepted/rejected (customer), new estimate / revised estimate, booking confirmed, payment reminder, new message, new review received (seller), seller reply to review (customer), date availability changed on a saved seller. Email notifications mirror the high-value ones (new request, estimate received, booking confirmed) — see TRD Section 12. Push notifications are out of scope for V1 (web app first).

### 6.8 Favorites & Compare

- Save any seller or feed post to Favorites (single flat list in V1 — multi-board "Dream Wedding / Decor Ideas" collections are Roadmap).
- **Compare tool:** select up to 3 saved sellers of the same category and view them side by side (price, rating, capacity, key inclusions, reviews count). Low build cost, high perceived value — kept in V1 deliberately even though it wasn't in the core roadmap phase, because it directly supports the "comparing catering menus is confusing" problem from Section 2.

### 6.9 Seller Dashboard

- **Onboarding wizard** (6 steps): Business info → Upload visuals → Add services/menu → Set availability → Add social links → Submit for approval. Each step saves progressively (a seller who drops off at step 3 doesn't lose steps 1–2).
- **Dashboard home:** new/pending requests, upcoming confirmed bookings, unread messages, profile views, recent activity, quick actions (add service, upload gallery image, create feed post).
- **Profile management:** edit everything from onboarding, post-launch.
- **Services management:** CRUD for services/packages.
- **Menu management (Catering only):** categorized menu items, unit pricing, minimum quantities, package bundles.
- **Availability calendar:** as Section 6.4.
- **Booking requests inbox** + **Estimate builder** (Section 6.3).
- **Messages.**
- **Gallery management:** upload, categorize, reorder, set cover image.
- **Feed post management:** create/delete posts.
- **Reviews management:** view + reply.
- **Analytics:** profile views, search appearances, requests received/accepted/rejected, most-viewed service, review trend. (Basic counts in V1; no cohort/funnel analytics.)
- **Settings:** login, notifications, business hours, cancellation policy, booking rules.

### 6.10 Admin Panel

- **Dashboard:** platform totals (users, sellers, bookings), pending seller approvals, open reports, recent activity.
- **Seller management:** review pending applications (including uploaded CNIC/business docs), approve/reject with a reason, suspend an existing seller, mark verified/featured.
- **User management:** view, suspend, or block customer accounts.
- **Category & city management:** V1 ships with four categories and Sukkur pre-seeded, but both are admin-editable collections, not hardcoded — this is what makes Phase 2 (new categories, new cities) a data change, not a re-deploy.
- **Booking oversight:** read-only view across all bookings for support/dispute purposes.
- **Reviews & reports:** moderate flagged reviews and handle user-submitted reports (fake seller, inappropriate content).
- **Homepage content:** manage featured sellers and hero content.
- **Analytics:** signups, top searched categories, most-booked sellers, conversion funnel (search → request → booking).

---

## 7. Non-Functional Requirements (summary — full detail in TRD)

- Mobile-first responsive design; the majority of Pakistani traffic will be Android/mobile.
- Page load performance targets and Core Web Vitals thresholds: TRD Section 13.
- WCAG 2.1 AA accessibility minimum.
- Dark mode and light mode, user-toggleable, system-preference default.
- SEO-indexable public pages (server-rendered, structured data, sitemaps).
- All customer-facing text in English for V1; UI copy structured for future i18n (Roadmap: Urdu).

---

## 8. Success Metrics (V1)

| Metric | Why it matters |
|---|---|
| Seller sign-up → approved → first listing live (time & %) | Seller-side funnel health |
| Search → booking request conversion rate | Core discovery-to-intent funnel |
| Booking request → confirmed booking conversion rate | Negotiation flow effectiveness |
| Median time from request to first seller response | Seller responsiveness, retention driver |
| % of bookings with a review left | Trust-loop closure |
| Repeat customers (2+ events planned) | Retention signal |
| "Buy Us a Coffee" tip volume | Early goodwill/monetization signal (not a growth target) |

---

## 9. Monetization (V1)

V1 deliberately monetizes lightly. The priority is proving the core loop (search → compare → request → negotiate → book → review) works and earns trust on both sides — not extracting revenue from a still-unproven marketplace.

- **"Buy Us a Coffee"** voluntary one-time support payments (Section 6.5) — the only monetization mechanic in V1.
- **No commission, no booking fees, no subscriptions, no featured-listing purchases, no lead-gen fees** in V1. The platform does not take a cut of any booking. This is a deliberate simplification: it removes friction and legal complexity from the core loop entirely (Section 10), at the cost of not earning from the transactions it facilitates — an acceptable trade for an MVP focused on adoption. Admin can still manually mark a seller "Featured" at no charge for homepage curation purposes.
- Real monetization (commission on bookings, seller subscription tiers, paid featured listings) is explicitly a Roadmap decision (Section 12), to be revisited once there's real vendor/customer volume and, if commission-style fees are pursued, likely a formal licensed payment-aggregator relationship to handle it properly (Section 10).

---

## 10. Business & Legal Considerations (read carefully — not legal advice)

Two things worth flagging plainly, since they shape the technical design elsewhere in this document set:

1. **Holding customer funds is regulated in Pakistan.** The State Bank of Pakistan's Payment Systems & Electronic Fund Transfers Act governs entities that hold or route funds on behalf of others, with licensing (PSO/PSP, or an EMI license) generally required. A marketplace that pools customer deposits and pays them out to vendors later is doing exactly that — which is exactly what V1 avoids by design: booking deposits settle directly between customer and seller, and the only money the platform itself ever collects is the voluntary "Buy Us a Coffee" support payment, which is unambiguously the platform's own revenue for its own service, not funds held for a third party. This gives V1 a genuinely low-risk payments footprint. If commission-based monetization or true in-app escrow becomes worth pursuing later (Section 12), that's a conversation for a lawyer and likely a licensed payment-aggregator partner at that point — not something to build into V1 by default.
2. **Verification documents (CNIC, business registration) are sensitive personal data.** They should live in a private, admin-only storage bucket with strict access rules, not in the same public-facing storage as gallery photos. This is specified in the Backend Schema Document, Section 7.

I'm not a lawyer and this isn't a substitute for legal advice — treat this as a flag to get proper counsel on before scaling the payment model, not a final answer.

---

## 11. Assumptions Log

Explicit assumptions made without asking, per your instruction to proceed rather than block on clarification:

1. Launch city is Sukkur — your roadmap scoped Phase 1 to a single city; Sukkur is your explicit choice rather than the largest-market default (Section 3.1 note below on why single-city-first holds regardless of which city).
2. "DreamEvents" is the product's public brand name; "EventConnect" is treated as the internal project codename only.
3. Currency is PKR throughout, with the schema storing currency as a field (not hardcoded) so multi-currency is possible later.
4. Booking-confirmation fee amount/percentage is left as a configurable business decision, not fixed by this spec.
5. "Verified seller" = admin-approved with documents reviewed; "verified review" = tied to a completed booking. Neither implies a legal identity-verification guarantee.
6. Web-first (responsive, installable as a PWA later); native mobile apps are out of scope for V1.
7. Backend stack is Express + MongoDB (Mongoose) as per your explicit preference, not NestJS + Prisma + Postgres. The existing documents that specified NestJS/Prisma have been adapted to this stack while preserving all business logic.
8. Frontend is a React 19 SPA built with Vite and react-router — plain JavaScript, no TypeScript, no SSR framework — deployed to a static host (Netlify or Vercel). All business logic lives in the Express backend; the SPA only calls the API.
9. "Buy Us a Coffee" uses Safepay for the actual payment collection, but the platform does not hold or route booking funds.
10. Four categories (Venue, Catering, Photography, Decoration) are in V1 as you specified in your latest instructions.

---

## 12. Roadmap (context only — not specified in build detail here)

- **Phase 2 — Expansion:** Add DJ/Sound, Makeup, Transport categories; expand to Karachi and Islamabad; bundle booking (venue + catering + decoration as one package).
- **Phase 3 — Intelligence:** AI Event Planner, AI Budget Planner, AI recommendation engine, AI chat assistant for sellers, AI-assisted content/description generation, AI image tagging, AI fraud/anomaly detection; seller subscription tiers and paid featured listings.
- **Phase 4 — Scale:** Nationwide coverage, multi-language (Urdu) interface, digital invitations & RSVP management, virtual/360° tours, deeper analytics, potential formal payment-aggregator partnership enabling true in-app escrow.

Each of these is a data/feature extension of the V1 schema and architecture, not a rebuild — that compatibility is a deliberate design constraint carried through the Technical Requirements and Backend Schema documents.