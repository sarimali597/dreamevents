# DreamEvents — UI/UX Design Brief

**Version 1.0 · The Visual & Interaction Language · V1 Scope**  
**Companion to:** `01-Product-Requirements-Document.md` | `02-Technical-Requirements-Document.md` | `03-App-Flow-Document.md` | `05-Backend-Schema-Document.md` | `06-Implementation-Plan.md`

---

##  Document Map — How This Brief Connects to the Handoff Set

| This Section | References | Purpose |
|---|---|---|
| §1 Brand Positioning | PRD §1–2, §4 | Why the visual language exists |
| §2 Design Tokens | TRD §2 (Stack), PRD §6 (Modules) | Exact colors, type, spacing for implementation |
| §3 Typography | TRD §2, §13 (Performance) | Font loading, scale, hierarchy |
| §4 Spacing & Elevation | TRD §2 (Tailwind) | Layout rhythm, shadow system |
| §5 Component Direction | PRD §6.1–6.10, App Flow §2–9 | Reusable UI patterns per feature |
| §6 Iconography | TRD §2 (lucide-react) | Icon rules & custom event-type set |
| §7 Motion & Animation | TRD §2 (GSAP, Motion, Lenis) | Animation tool assignment & timing specs |
| §8 Imagery & Maps | TRD §10.2–10.3, PRD §6.1 | Photography direction, MapLibre styling |
| §9 Screen Direction | App Flow §1 (Sitemap), PRD §6 | Per-screen layout & interaction rules |
| §10 Empty/Loading/Error | App Flow §9, TRD §13 | Resilience design |
| §11 Accessibility | PRD §7, TRD §14 | WCAG 2.1 AA compliance rules |
| §12 Responsive | TRD §2, PRD §7 | Breakpoint strategy |
| §13 Design System Code | Implementation Plan §3 | Copy-paste CSS variables for the agent |
| §14 State-Color Matrix | App Flow §5, Backend Schema §5 | Status → color mapping reference |

---

## 1. Brand Positioning — The Soul of the Interface

DreamEvents lives in the space between **two emotions that rarely coexist**: the fluttering excitement of planning a wedding or celebration, and the quiet confidence of a system you can trust with your money and your most important date.

Pakistan's event-services market today runs on Instagram grids and WhatsApp numbers — warm and deeply personal, but structurally opaque. Enterprise marketplace patterns are structured but cold. DreamEvents must be **both**: professional enough that a venue owner trusts it with their calendar, and warm enough that a bride-to-be loses herself browsing it at 2 AM.

### 1.1 Five Design Principles (Ranked)

> **1. Trustworthy before beautiful.**  
> Verified badges, real ratings, transparent pricing, and clear availability status are never buried under decoration. If a design choice makes trust signals less legible, the design choice loses. *(See PRD §6.6 for review verification, Backend Schema §4.3 for `verificationStatus` fields.)*

> **2. Visual, not textual.**  
> This is a category people shop with their eyes — galleries, cover photos, and the inspiration feed carry more weight than paragraphs. Every listing should feel like scrolling a beautiful wedding album, not reading a spec sheet. *(See PRD §6.1 for gallery/feed requirements.)*

> **3. Mobile-first, genuinely.**  
> Not "responsive as an afterthought." The majority of Pakistani traffic will search, compare, and message on a phone. Every core flow is designed at **375px width first**, then expanded. *(See PRD §7, TRD §13.)*

> **4. Celebratory without being loud.**  
> Gold and jewel-tone accents earn their place at moments of delight — a confirmed booking, a 5-star review, a featured seller highlight. They are not the default state of every button on every screen.

> **5. Calm under negotiation.**  
> The booking/negotiation flow is inherently tense (money, dates, back-and-forth). The UI here feels unhurried and clear — generous spacing, plain language, no dark patterns pushing urgency the user did not ask for. *(See PRD §6.3, App Flow §3 for the negotiation state machine.)*

---

## 2. Design Tokens — The Atomic Language

This section provides **exact, implementation-ready values**. Every hex code, HSL value, and usage rule below is calculated from the brand anchors and ready for direct use in `globals.css` and `tailwind.config.js`. *(See §13 for the copy-paste CSS block.)*

### 2.1 Brand Color Anchors

These four anchors are immutable. Every scale below is mathematically derived from them.

| Token | Hex | HSL | Role |
|---|---|---|---|
| `--color-primary` (Baltic Blue) | `#306998` | `hsl(207, 52%, 39%)` | Primary actions, links, headers, trust/verified elements |
| `--color-accent` (Golden Pollen) | `#FFD43B` | `hsl(47, 100%, 62%)` | Ratings/stars, highlights, celebratory moments, premium CTA accents |
| `--color-ink` (Space Indigo) | `#1A1A2E` | `hsl(240, 28%, 14%)` | Dark-mode surface base, footer, highest-contrast text |
| `--color-base` (White) | `#FFFFFF` | `hsl(0, 0%, 100%)` | Light-mode surface base |

### 2.2 Primary Scale — Baltic Blue

Generated from anchor `#306998` at step `600`. Use this exact scale in Tailwind/CSS.

| Step | Hex | HSL | Usage |
|---|---|---|---|
| `50` | `#f3f7fb` | `hsl(207, 52%, 97%)` | Tinted backgrounds, info panels, hover table rows |
| `100` | `#e7f0f7` | `hsl(207, 52%, 94%)` | Subtle section backgrounds, input focus rings |
| `200` | `#d0e1f0` | `hsl(207, 52%, 88%)` | Borders, dividers, disabled primary buttons |
| `300` | `#b9d3e8` | `hsl(207, 52%, 82%)` | Secondary borders, chart grid lines |
| `400` | `#9ac0df` | `hsl(207, 52%, 74%)` | Secondary text on brand backgrounds |
| `500` | `#6ba3d0` | `hsl(207, 52%, 62%)` | Loading spinners, placeholder text |
| `600` | `#306998` | `hsl(207, 52%, 39%)` | **Anchor.** Default buttons, links, primary brand usage |
| `700` | `#27557c` | `hsl(207, 52%, 32%)` | Button hover states, active nav items |
| `800` | `#1a3b55` | `hsl(207, 52%, 22%)` | Dark-mode primary text, deep headers |
| `900` | `#112536` | `hsl(207, 52%, 14%)` | Dark-mode button fills, deep accents |
| `950` | `#09151f` | `hsl(207, 52%, 8%)` | Darkest surfaces, code blocks |

### 2.3 Accent Scale — Golden Pollen

Generated from anchor `#FFD43B` at step `400` (it is naturally bright). Used sparingly — it is the "celebration" color, not the default.

| Step | Hex | HSL | Usage |
|---|---|---|---|
| `50` | `#fffbef` | `hsl(47, 100%, 97%)` | Featured-ribbon backgrounds, gold-tinted cards |
| `100` | `#fff8e0` | `hsl(47, 100%, 94%)` | Highlight backgrounds, star-rating empty state |
| `200` | `#fff1c1` | `hsl(47, 100%, 88%)` | Soft gold borders, celebratory badges |
| `300` | `#ffeba3` | `hsl(47, 100%, 82%)` | Secondary gold accents |
| `400` | `#ffe27a` | `hsl(47, 100%, 74%)` | **Anchor.** Featured seller pins, premium highlights |
| `500` | `#ffd53d` | `hsl(47, 100%, 62%)` | Star fills, rating icons, accent buttons |
| `600` | `#ffd43b` | `hsl(47, 100%, 62%)` | Brand gold — celebratory CTAs, "Buy Us a Coffee" |
| `700` | `#a37f00` | `hsl(47, 100%, 32%)` | Dark-mode gold text, pressed states |
| `800` | `#705700` | `hsl(47, 100%, 22%)` | Dark-mode gold borders |
| `900` | `#473700` | `hsl(47, 100%, 14%)` | Dark-mode gold backgrounds |
| `950` | `#281f00` | `hsl(47, 100%, 8%)` | Deepest gold tint |

### 2.4 Ink Scale — Space Indigo

Generated from anchor `#1A1A2E` at step `900`. The dark-mode soul of the product.

| Step | Hex | HSL | Usage |
|---|---|---|---|
| `50` | `#f5f5f9` | `hsl(240, 28%, 97%)` | Lightest indigo tint |
| `100` | `#ebebf3` | `hsl(240, 28%, 94%)` | Dark-mode card borders (subtle) |
| `200` | `#d7d7e8` | `hsl(240, 28%, 88%)` | Dark-mode input borders |
| `300` | `#c4c4dd` | `hsl(240, 28%, 82%)` | Dark-mode secondary text |
| `400` | `#aaaacf` | `hsl(240, 28%, 74%)` | Dark-mode placeholder text |
| `500` | `#8282b9` | `hsl(240, 28%, 62%)` | Muted indigo accents |
| `600` | `#19192e` | `hsl(240, 28%, 14%)` | — |
| `700` | `#3a3a68` | `hsl(240, 28%, 32%)` | Dark-mode hover surfaces |
| `800` | `#282847` | `hsl(240, 28%, 22%)` | Dark-mode elevated cards |
| `900` | `#19192d` | `hsl(240, 28%, 14%)` | **Anchor.** Dark-mode base surface |
| `950` | `#0e0e1a` | `hsl(240, 28%, 8%)` | Deepest dark surface, footer background |

### 2.5 Neutral Scale — Slate

Do not derive grays from the brand blue — that tints body text and makes it muddy. Use Tailwind's built-in `slate` scale (slight cool undertone, pairs naturally with Baltic Blue).

| Step | Hex | Usage |
|---|---|---|
| `50` | `#f8fafc` | Page backgrounds (light mode) |
| `100` | `#f1f5f9` | Card backgrounds, subtle sections |
| `200` | `#e2e8f0` | Borders, dividers |
| `300` | `#cbd5e1` | Disabled borders, inactive tabs |
| `400` | `#94a3b8` | Placeholder text, muted meta |
| `500` | `#64748b` | Secondary text, icons |
| `600` | `#475569` | Body text (light mode secondary) |
| `700` | `#334155` | Strong secondary text |
| `800` | `#1e293b` | Headings, primary text (light mode) |
| `900` | `#0f172a` | Deepest text, dark-mode body |
| `950` | `#020617` | — |

### 2.6 Semantic Colors — Status & Feedback

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-success` | `#059669` (emerald-600) | `#34d399` (emerald-400) | Available dates, approved status, confirmed bookings, positive trends |
| `--color-warning` | `#d97706` (amber-600) | `#fbbf24` (amber-400) | Pending status, negotiating, hold states, low-stock warnings |
| `--color-error` | `#dc2626` (red-600) | `#f87171` (red-400) | Booked/unavailable dates, rejected requests, destructive actions, expired holds |
| `--color-info` | `#306998` (primary-600) | `#6ba3d0` (primary-500) | Informational banners, tooltips, system messages |

> **Critical:** `warning` uses **amber**, not the golden accent. Pending states must never look "premium" or "featured." The distinction is intentional and trust-critical.

### 2.7 Dark Mode Mapping

| Token | Light Mode Value | Dark Mode Value | Notes |
|---|---|---|---|
| `--surface-base` | `white` | `#0e0e1a` (ink-950) | Never pure black — keeps the indigo soul |
| `--surface-raised` (cards) | `white` + soft shadow | `#19192d` (ink-900) + `1px solid #3a3a68` (ink-700 border) | Shadows don't read on dark; use borders |
| `--surface-sunken` (inputs) | `#f8fafc` (slate-50) | `#0e0e1a` (ink-950) | Inputs sit slightly below cards |
| `--text-primary` | `#0f172a` (slate-900) | `#f8fafc` (slate-50) | |
| `--text-secondary` | `#475569` (slate-600) | `#94a3b8` (slate-400) | |
| `--text-tertiary` | `#64748b` (slate-500) | `#64748b` (slate-500) | Same in both modes |
| `--border-default` | `#e2e8f0` (slate-200) | `#3a3a68` (ink-700) | |
| `--border-subtle` | `#f1f5f9` (slate-100) | `#282847` (ink-800) | |
| `--color-primary` (interactive) | `#306998` (primary-600) | `#6ba3d0` (primary-500) | Lightened for AA contrast on dark indigo |
| `--color-accent` | `#ffd43b` (accent-600) | `#ffd53d` (accent-500) | Slightly more generous in dark mode — gold glows against indigo |

### 2.8 Gradients

The original four-stop gradient across all four brand colors fights itself. Use these **two refined 2-stop gradients** sparingly:

| Name | Value | Usage |
|---|---|---|
| `--gradient-trust` | `linear-gradient(135deg, #27557c, #0e0e1a)` | Hero sections, dark-mode premium surfaces, footer overlays |
| `--gradient-celebrate` | `linear-gradient(135deg, #ffe27a, #306998)` | Featured badges, confirmation moments, "Buy Us a Coffee" card background |
| `--gradient-subtle` | `linear-gradient(180deg, transparent, rgba(14,14,26,0.6))` | Image overlays (text on photos) — always bottom-heavy |

---

## 3. Typography — The Voice of the Interface

### 3.1 Typeface Selection

| Role | Typeface | Weight Range | Why |
|---|---|---|---|
| **Display / Headlines** | **Fraunces** (Google Fonts, variable) | 400–700 | Soft-contrast serif with warmth and editorial character. Reads as "celebration" and "craft" without tipping into bridal-magazine cliché. |
| **Body / UI** | **Geist Sans** (free) | 400–700 | Clean, highly legible at small sizes. Essential for dense dashboard UI. Natural pairing with React (Vite). |
| **Numeric / Tabular** | **Geist Mono** (optional) | 400–600 | Prices, dates, estimate line-items read more precisely in monospaced numerals. *(See PRD §6.3 for estimate builder.)* |

### 3.2 Type Scale

Use `clamp()` for fluid sizing between mobile and desktop. Base font size: `16px` (1rem).

| Token | Mobile | Desktop | Weight | Line Height | Letter Spacing | Font | Use |
|---|---|---|---|---|---|---|---|
| `--text-display` | 2.5rem | 4rem | Fraunces 500 | 1.1 | -0.02em | Fraunces | Hero headline only |
| `--text-h1` | 2rem | 2.75rem | Fraunces 500 | 1.15 | -0.01em | Fraunces | Page titles |
| `--text-h2` | 1.5rem | 2rem | Fraunces 500 | 1.2 | -0.01em | Fraunces | Section headers |
| `--text-h3` | 1.25rem | 1.5rem | Geist 600 | 1.3 | 0 | Geist | Card titles, subsections |
| `--text-h4` | 1.125rem | 1.25rem | Geist 600 | 1.35 | 0 | Geist | List headers, form section titles |
| `--text-body` | 1rem | 1rem | Geist 400 | 1.6 | 0 | Geist | Default body copy |
| `--text-body-sm` | 0.875rem | 0.875rem | Geist 400 | 1.5 | 0 | Geist | Compact body, descriptions |
| `--text-small` | 0.875rem | 0.875rem | Geist 400 | 1.4 | 0.01em | Geist | Meta text, timestamps, captions |
| `--text-micro` | 0.75rem | 0.75rem | Geist 500 | 1.3 | 0.02em | Geist | Badges, labels, table headers, tags |
| `--text-price` | 1.25rem | 1.5rem | Geist Mono 600 | 1.2 | -0.01em | Geist Mono | Prices in cards, estimates |

### 3.3 Font Loading

Self-host `.woff2` files in `frontend/public/fonts/` and declare them with CSS `@font-face` (plus a `<link rel="preconnect">` to Google Fonts only as a fallback for the CDN-served Geist/Source files). Use `font-display: swap` for zero layout shift. Never block render on font loading. *(See TRD §13 for performance targets.)*

```js
/* frontend/src/styles/fonts.css — referenced from index.html */
@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/Fraunces.woff2') format('woff2');
  font-weight: 400 900;
  font-style: normal;
  font-display: swap;
  font-feature-settings: 'ss01' on;
}

@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/GeistSans.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
```

---

## 4. Spacing, Radius & Elevation

### 4.1 Spacing Scale

Use Tailwind's default 4px base unit. No custom spacing scale — consistency with Tailwind defaults keeps the agent predictable.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon gaps, tight inline spacing |
| `--space-2` | 8px | Button padding-y, badge padding |
| `--space-3` | 12px | Card internal padding (compact) |
| `--space-4` | 16px | Card internal padding (standard), section gap mobile |
| `--space-5` | 20px | Form field gaps |
| `--space-6` | 24px | Section padding mobile, card gap |
| `--space-8` | 32px | Section padding desktop, page gutters |
| `--space-10` | 40px | Large section separation |
| `--space-12` | 48px | Hero internal padding |
| `--space-16` | 64px | Major section breaks |
| `--space-20` | 80px | Page top/bottom padding |
| `--space-24` | 96px | Hero vertical padding |

### 4.2 Border Radius

Warm, rounded system. Avoid sharp corners — they read as cold/enterprise.

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Inputs, small buttons, tags |
| `--radius-md` | 12px | Cards, dialogs, panels |
| `--radius-lg` | 20px | Modals, hero panels, feature images, onboarding wizard steps |
| `--radius-xl` | 28px | Large promotional cards, bottom sheets |
| `--radius-full` | 9999px | Pills, avatars, badges, floating action buttons |

### 4.3 Elevation

**Light Mode:** Soft, warm-tinted shadows.

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px hsla(207, 52%, 20%, 0.06)` | Subtle card lift |
| `--shadow-md` | `0 4px 12px hsla(207, 52%, 20%, 0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 24px hsla(207, 52%, 20%, 0.10)` | Modals, drawers, floating panels |
| `--shadow-xl` | `0 16px 48px hsla(207, 52%, 20%, 0.12)` | Hero overlays, premium cards |
| `--shadow-glow` | `0 0 20px hsla(47, 100%, 62%, 0.3)` | Featured seller hover, celebratory moments |

**Dark Mode:** Shadows are replaced by **borders** (shadows don't read on dark surfaces).

| Token | Value | Usage |
|---|---|---|
| `--shadow-dark-sm` | `inset 0 1px 0 #3a3a68` | Subtle top highlight on cards |
| `--shadow-dark-md` | `0 0 0 1px #3a3a68` | Card borders |
| `--shadow-dark-lg` | `0 0 0 1px #3a3a68, 0 4px 12px rgba(0,0,0,0.3)` | Modals with depth |

---

## 5. Component Design System

Built on **shadcn/ui primitives** (Button, Input, Select, Dialog, Sheet, Tabs, Table, Card, Calendar, Command, Popover, Toast, Badge, Avatar, Dropdown Menu, Separator, Skeleton). Theme entirely via the CSS variables in §2 and §13 — never hand-override per component.

### 5.1 Buttons

| Variant | Background | Text | Border | Hover | Usage |
|---|---|---|---|---|---|
| **Primary** | `primary-600` | `white` | none | `primary-700` + `shadow-md` | Default action: "Search", "Send Request", "Save" |
| **Secondary** | transparent | `primary-600` | `1px solid primary-600` | `primary-50` bg | Alternative action: "Cancel", "Back", "Filter" |
| **Ghost** | transparent | `primary-600` | none | `primary-50` bg | Tertiary: "View details", text links |
| **Accent** (Celebration) | `accent-600` | `ink-950` | none | `accent-500` + `shadow-glow` | **Reserved for:** "Confirm Booking", "Leave a Review", "Buy Us a Coffee" — genuinely celebratory moments only |
| **Destructive** | `error` | `white` | none | darken 10% | "Decline", "Remove", "Delete" |
| **Status** | varies | `white` | none | darken 10% | See §14 State-Color Matrix |

**Button sizing:**
- `sm`: height 32px, padding 0 12px, radius `radius-sm`, font `text-micro`
- `md`: height 40px, padding 0 16px, radius `radius-sm`, font `text-body-sm`
- `lg`: height 48px, padding 0 24px, radius `radius-md`, font `text-body` — **CTA size**
- `xl`: height 56px, padding 0 32px, radius `radius-md`, font `text-h4` — **Hero CTA only**

**Touch target:** All buttons must be minimum **44×44px** on mobile, even if visually smaller (increase hit area).

### 5.2 Cards — The Heart of the Product

Cards are the most repeated component. They must feel like a beautiful wedding album, not a directory listing.

**Seller Result Card** (used in `/explore`, `/favorites`, feed, compare):

```
┌─────────────────────────────────────┐  ← radius-md (12px), overflow hidden
│  ┌───────────────────────────────┐  │
│  │  COVER IMAGE (16:9)  │  │  ← aspect-ratio 16/9, object-fit cover
│  │  [ Verified]  [ Save] │  │  ← Verified badge: top-left, absolute
│  │  │  │  Save heart: top-right, absolute
│  └───────────────────────────────┘  │
│  Business Name  4.8 (24)  │  ← H3, Fraunces. Rating: accent stars
│  Category · Area  PKR 15,000+ │  ← Small, slate-500. Price: mono, primary
│  [Available for your date]  │  ← Optional: success pill if date matches
└─────────────────────────────────────┘
```

- **Hover state:** `shadow-lg` + `translateY(-2px)` + 200ms ease-out. On mobile: no hover, use active state (`scale(0.98)`).
- **Featured variant:** `accent-200` left border (4px) + subtle gold glow shadow.
- **Skeleton:** Maintain exact aspect ratios — 16:9 image placeholder, text lines at 60% and 40% width.

### 5.3 Status Pills

Consistent across **all** screens. Status color is a trust signal and must mean the same thing everywhere. *(See App Flow §5 for state machines, Backend Schema §5 for status fields.)*

| Status | Background | Text | Icon | Used In |
|---|---|---|---|---|
| Available | `success` bg, 15% opacity | `success` text | Check circle | Calendar, search results |
| Pending / Hold | `warning` bg, 15% opacity | `warning` text | Clock | Calendar, booking requests, estimates |
| Booked / Confirmed | `error` bg, 15% opacity | `error` text | Lock | Calendar, bookings |
| Blocked | `slate-400` bg, 15% opacity | `slate-600` text | Ban | Calendar (seller only) |
| Approved | `success` bg, 15% opacity | `success` text | Shield check | Seller profiles, admin |
| Rejected / Expired | `error` bg, 15% opacity | `error` text | X circle | Booking requests, estimates |
| Negotiating | `warning` bg, 15% opacity | `warning` text | Message circle | Booking requests |
| Draft | `slate-400` bg, 15% opacity | `slate-600` text | File | Estimates (seller builder) |

**Pill style:** `radius-full`, height 24px, padding 0 10px, font `text-micro`, with 16×16px icon.

### 5.4 Structured Message Cards (Chat/Negotiation)

Visually distinct from plain chat bubbles. These are the **most trust-critical UI elements** in the product — the user must never wonder "is this a real offer or just a message?"

**Estimate Card:**
- Outer: `radius-md` card, `1px solid primary-200`, `primary-50` background (light) / `ink-800` background (dark)
- Header: "Estimate #2" + validity date + version badge
- Body: Line-item table (name | qty | unit | total) with `text-price` mono font
- Divider: Subtotal → Discount → Service Charge → Tax → **Total** (bold, accent color)
- Actions: "Accept" (accent button) | "Request Changes" (secondary) | "Reject" (ghost, error text)

**Booking Summary Card:**
- Similar structure but locked — no actions, just confirmation details
- Green left border (`success`), checkmark icon

**System Notification Card:**
- Centered, no bubble tail, `info` background, small icon
- Used for: "Seller has offered an alternative date", "48-hour hold expires soon"

### 5.5 Forms & Inputs

- **Input height:** 44px minimum (mobile touch target)
- **Border:** `1px solid slate-200`, radius `radius-sm`
- **Focus:** `2px solid primary-500` ring, `primary-50` background tint
- **Error:** `1px solid error`, `error` text below, `error` icon inline
- **Label:** `text-body-sm`, Geist 500, `slate-700`, above input with 6px gap
- **Helper text:** `text-small`, `slate-500`, below input
- **Required indicator:** `error` asterisk, not red text on label

**Multi-step forms** (onboarding wizard, booking request):
- Persistent progress indicator at top: step dots + step name
- "Next" is primary, "Back" is ghost
- Each step saves independently (seller onboarding resumes at dropped step — see App Flow §6)
- Final step: review summary before submit

### 5.6 Navigation Patterns

**Public Header:**
- Fixed top, `white`/`ink-950` background, `shadow-sm` on scroll
- Left: Logo (Fraunces wordmark) + hamburger (mobile)
- Center: Search bar (collapses to icon on mobile)
- Right: "List your business" (secondary) + "Sign In" (primary) / Avatar dropdown (authed)
- Height: 64px desktop, 56px mobile

**Dashboard Sidebar** (customer/seller/admin):
- Fixed left, width 260px desktop, collapsible to 72px icon-only
- Background: `white` (light) / `ink-900` (dark)
- Border-right: `1px solid slate-200` / `ink-700`
- Active item: `primary-50` bg + `primary-600` left border (3px) + `primary-600` text
- Section headers: `text-micro`, `slate-400`, uppercase, tracking wide
- Bottom: User mini-card (avatar + name + role pill)

**Mobile Bottom Nav:**
- Fixed bottom, height 64px, `white`/`ink-950` bg, `shadow-lg` (top-only)
- 4–5 items: icon + label, active = `primary-600` + filled icon
- Safe-area-inset-bottom padding for notched phones

---

## 6. Iconography

**Primary set:** `lucide-react` — 1.5–2px stroke weight, outline style throughout. Never mix filled and outline in the same context.

**Custom event-type icons** (hand-built SVGs, same stroke weight, 24×24px viewBox):

| Event Type | Icon Concept | Used In |
|---|---|---|
| Wedding | Two interlocking rings | Search filters, event creation, category tags |
| Mehndi | Henna hand motif | Search filters, event creation |
| Engagement | Diamond ring | Search filters, event creation |
| Birthday | Cake with candle | Search filters, event creation |
| Corporate | Briefcase | Search filters, event creation |
| Family | Family silhouette | Search filters, event creation |

> These 6 custom icons are worth the effort — they appear on nearly every form and filter in the product. Keep stroke weight at 1.5px, corner radius at 2px, and use `currentColor` for fill so they inherit text color.

---

## 7. Motion & Animation — Tool Assignment & Timing Specs

Three tools, three distinct jobs. Never blur their responsibilities.

| Tool | Job | Examples | Implementation |
|---|---|---|---|
| **GSAP + ScrollTrigger + Lenis** | Macro, scroll-driven storytelling | Homepage hero pinning, "How It Works" step reveal on scroll, parallax on seller cover images, smooth-scroll feel site-wide | `gsap.registerPlugin(ScrollTrigger)`; Lenis for `requestAnimationFrame` smooth scroll |
| **Motion (motion.dev)** | Micro, component-level transitions | Modal/dialog open-close, list item enter/exit (new message, filter chip), page transitions between related views, button press, card hover | `<AnimatePresence>`, `motion.div` with `layout` prop |
| **Magic UI / Aceternity UI** | Marketing-page set pieces | Bento grid on homepage, animated beams connecting "Search → Compare → Book" in How It Works, spotlight/glow hover on featured seller cards, text shimmer effects | Import as components, theme with our tokens |

### 7.1 Timing Specifications

| Animation Type | Duration | Easing | Notes |
|---|---|---|---|
| Button press | 100ms | `ease-out` | `scale(0.97)` on active |
| Toggle / checkbox | 150ms | `ease-in-out` | Checkmark draw + background fill |
| Card hover lift | 200ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | `translateY(-2px)` + shadow increase |
| Modal open | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Scale from 0.95 + fade, origin center |
| Modal close | 200ms | `ease-in` | Faster close than open |
| Page transition | 300ms | `ease-in-out` | Fade + slight slide (Motion) |
| List item enter | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Slight overshoot bounce for new messages |
| List item exit | 200ms | `ease-in` | Collapse height + fade |
| Scroll reveal (GSAP) | 500–800ms | `power2.out` | Stagger 100ms between items |
| Skeleton shimmer | 1500ms | `linear` | Infinite `translateX` sweep |
| Typing indicator | 600ms | `ease-in-out` | Three dots pulse, staggered 150ms |
| Notification slide | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide from top-right + fade |
| Toast enter/exit | 300ms / 200ms | `ease-out` / `ease-in` | Slide up + fade |

### 7.2 Reduced Motion

Every animation respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  }
}
```

GSAP: Provide static fallback (content present, not animated in).  
Motion: Use `useReducedMotion()` hook to skip animations.  
Magic UI: Render static version of components.

---

## 8. Imagery & Map Styling

### 8.1 Photography Direction

**The product's actual selling point is image quality.** Guide sellers explicitly:

- **Warm, authentic, real-event photography** — not generic stock-photo weddings
- Natural light preferred; real setups the seller has actually done
- Avoid: watermarked stock images, overly staged poses, low-resolution phone photos
- Encourage: detail shots (table settings, floral arrangements, food plating), wide venue shots, candid guest moments
- **Cover images:** 16:9, minimum 1200×675px, well-lit, representative of the business
- **Gallery images:** Mix of 4:3 and 1:1, minimum 800×600px, categorized (venue/food/decoration/photos)

### 8.2 Image Handling

- Use Cloudinary image URLs with `f_auto/q_auto` transforms for automatic optimization
- Lazy load below-the-fold images
- Placeholder: `blur` with tiny LQIP (Low-Quality Image Placeholder) from Cloudinary
- Aspect ratios enforced via CSS `aspect-ratio` to prevent layout shift *(See TRD §10.2)*

### 8.3 Map Styling (MapLibre GL JS + MapTiler)

- **Base map:** Custom muted/desaturated style — buildings and roads in soft neutrals, water in `primary-100`
- **Pins:** 
  - Standard: `primary-600` circle, 28px, white border 3px
  - Featured: `accent-500` star shape, 32px, white border 3px, `shadow-glow`
  - Selected: `primary-600` circle, 36px, `primary-200` border 4px, pulse animation
- **Clusters:** `primary-600` circle with white text, size scales with count
- **Popup card:** Same as seller result card but compact, `radius-md`, `shadow-lg`
- **"Search this area" button:** Appears after map drag, `accent` button variant, centered bottom of map

---

## 9. Screen-by-Screen Design Direction

### 9.1 Home (`/`) — The First Impression

**Goal:** Convert a visitor into a searcher in under 3 seconds.

- **Hero Section:** Full viewport height (100vh), `gradient-trust` background, GSAP-pinned on scroll
  - Center: Display headline (Fraunces) — "Find the perfect venue for your perfect day"
  - Below: Search bar (category dropdown + city + date + guests) — the visual anchor
  - Search bar: `white` bg, `radius-lg`, `shadow-xl`, height 64px, centered, max-width 800px
  - Background: Subtle animated particles or bokeh (Magic UI) in `primary-400` at 10% opacity
  - Scroll indicator: Bouncing chevron at bottom, `accent` color

- **How It Works:** 6-step horizontal scroll (mobile) / grid (desktop)
  - Magic UI animated beams connecting steps
  - Each step: icon (48px, `primary-600`) + H3 title + body text
  - Step labels: "01 Search" → "02 Compare" → "03 Check Availability" → "04 Request" → "05 Negotiate" → "06 Confirm"
  - Background: `slate-50` (light) / `ink-900` (dark)

- **Featured Sellers Rail:** Horizontal scroll on mobile, 4-column grid on desktop
  - Same card component as search results
  - "Featured" badge: `accent-600` pill, top-left of card
  - Section header: "Handpicked for you" (Fraunces H2) + "View all →" link

- **Inspiration Feed Preview:** 3×2 grid of feed post thumbnails
  - Square aspect ratio, `radius-md`, hover zoom 1.05
  - Caption overlay at bottom: gradient fade + white text
  - "Explore the feed →" CTA button

- **Testimonials:** 3-column layout, large quote marks (`primary-200`), verified badge under each name
  - Data from actual `completed` booking reviews *(See PRD §6.6, Backend Schema §6.1)*

- **Seller CTA Banner:** Full-width, `gradient-celebrate`, centered text
  - "Are you a venue or caterer? List your business — it's free."
  - "Get started" accent button

- **Footer:** `ink-950` background (always dark, regardless of mode)
  - 4-column link grid: Explore, Categories, Support, Company
  - Bottom row: copyright + `Crafted by Sarim, https://sarimfolio.vercel.app` in `text-micro`, `slate-500`

### 9.2 Explore / Search (`/explore`) — Discovery Engine

**Goal:** Help users find and compare sellers efficiently.

- **Layout (desktop):** 55% list (left, scrollable) | 45% map (right, sticky)
- **Layout (mobile):** Full-screen toggle between list and map, floating toggle button bottom-right
- **Filter bar:** Sticky below header, horizontal scroll on mobile
  - Category chips (scrollable), price range slider, rating filter, date picker
  - "More filters" opens Sheet drawer from bottom (mobile) / right sidebar (desktop)
- **Result cards:** As defined in §5.2, infinite scroll or pagination (20 per page)
- **Sort dropdown:** "Relevance" (default) | "Rating" | "Price: Low to High" | "Price: High to Low"
- **Empty state:** Illustration + "No results for these filters" + "Clear all filters" button + "Browse all venues in Sukkur" suggestion
- **Map:** As defined in §8.3, pins clickable → popup card → navigate to seller profile

### 9.3 Seller Profile / Storefront (`/seller/[slug]`) — The Portfolio

**Goal:** The highest-craft page in the product. Must feel like a curated portfolio, not a cluttered spec sheet.

**Information hierarchy (top to bottom):**

1. **Cover Section:** Full-bleed cover image (16:9, max-height 400px), `gradient-subtle` overlay at bottom
  - Business name (Fraunces H1), verified badge, rating + review count
  - Area, starting price (mono), category
  - Action row: "Request Booking" (primary lg) | "Message" (secondary) | "Save" (ghost, icon) | "Share" (ghost, icon)
  - **Mobile:** "Request Booking" is sticky at bottom (FAB style, full-width, `accent` button)

2. **About Section:** Collapsible on mobile, max 3 lines preview + "Read more"
  - Description text, business hours, policies (cancellation, advance payment, extra charges)

3. **Gallery Section:** Masonry or uniform grid (4:3), 8–12 images visible, "View all" opens lightbox
  - Categories: Venue | Food | Decoration | Photos | Other
  - Lightbox: `yet-another-react-lightbox`, dark backdrop, keyboard nav *(See TRD §10.2)*

4. **Services / Menu Section:**
  - Venue/Photo/Decor: Service cards (name, description, price, price type, capacity, inclusions)
  - Catering: Menu category tabs → item cards (name, description, unit price, min quantity, image)
  - Packages: Bundle cards with "What's included" list

5. **Availability Calendar:** Month view, read-only for visitors
  - Color coding: green (available), amber (pending), red (booked), gray (blocked)
  - Legend below calendar
  - Date picker for booking request disables red/gray dates *(See PRD §6.4, App Flow §5.4)*

6. **Reviews Section:** 
  - Aggregate: large rating number (Fraunces display) + star breakdown bars
  - Individual reviews: avatar, name, date, overall rating, 4 sub-ratings (service, price, communication, timeliness), text, photos, seller reply (if any)
  - "Helpful?" and "Flag" actions

7. **Location:** Map embed (static pin), address text, "Get directions" link

8. **Social Links:** Instagram, Facebook, YouTube, WhatsApp — icon row

### 9.4 Booking Request Flow — Calm & Clear

**Goal:** Remove friction and anxiety from the most important action.

**Trigger:** "Request Booking" button on seller profile → opens Sheet drawer (mobile) / Dialog (desktop)

**Form fields:**
- Event type: Custom icon radio group (Wedding, Mehndi, Engagement, Birthday, Corporate, Family, Other)
- Date: Calendar picker (disabled dates = booked/blocked for this seller)
- Time window: Select (Morning, Afternoon, Evening, Full Day, Custom)
- Guest count: Number input, min 1
- Budget range: Dual-handle slider (min/max in PKR)
- Special requirements: Textarea, max 2000 chars
- Message: Textarea, max 2000 chars, pre-filled polite template

**Submit:** Creates `BookingRequest` (status: `pending`) → redirects to `/messages/[id]` *(See App Flow §2, Backend Schema §5.2)*

### 9.5 Chat / Negotiation Thread (`/messages/[id]`)

**Goal:** The calm center of the transaction. WhatsApp-familiar but structured.

- **Header:** Seller avatar + name + status pill + "View profile" link
- **Message area:** Scrollable, bottom-aligned, bubble layout
  - Customer bubbles: right-aligned, `primary-600` bg, white text, `radius-lg` (top-right sharp)
  - Seller bubbles: left-aligned, `slate-100` bg (light) / `ink-800` bg (dark), `text-primary`, `radius-lg` (top-left sharp)
  - System messages: center, no bubble, `text-small`, `slate-500`
  - **Structured cards:** Full-width, break the bubble rhythm, as defined in §5.4
- **Input area:** Fixed bottom, textarea (auto-grow, max 4 lines) + attach image + send button
- **Typing indicator:** Three dots, `primary-400`, below seller's last message
- **Quick actions:** "Send deposit reminder" (customer) | "Build estimate" (seller) — floating above input

### 9.6 Customer Dashboard (`/dashboard`)

- **Stats row:** 4 cards — Upcoming events, Open requests, Unread messages, Saved vendors
- **Recent activity:** Timeline of latest actions (request sent, estimate received, message, booking confirmed)
- **Quick actions:** "Plan new event", "Browse venues", "View messages"
- **Upcoming events:** Card list with date countdown, status pill, linked bookings count

### 9.7 Seller Dashboard (`/seller-dashboard`)

- **Stats row:** 5 cards — New requests, Confirmed bookings, Unread messages, Profile views, Rating
- **Requests inbox:** Table or card list, filterable by status
- **Calendar:** Month view, editable (click to toggle available/blocked), color-coded
- **Estimate builder:** Full-screen modal/wizard
  - Line item table with live math (subtotal → discount → service charge → tax → total)
  - Category-specific templates (venue vs catering vs photo vs decor)
  - "Send estimate" → creates `Estimate` document, emits Socket.IO event *(See PRD §6.3, Backend Schema §5.3)*

### 9.8 Onboarding Wizard (`/seller-dashboard/onboarding`)

**6 steps, each savable independently:**

1. **Business Info:** Name, category, subcategory, city, area, address, description, contact
2. **Visuals:** Logo upload, cover image, gallery images (drag-drop, Cloudinary)
3. **Services/Menu:** Add services or menu categories+items *(See App Flow §6)*
4. **Availability:** Working days/hours, initial blocked dates, notice period
5. **Social Links:** Instagram, Facebook, YouTube, WhatsApp (all optional)
6. **Review & Submit:** Summary of all data, document upload (CNIC, business reg), submit button

**Visual treatment:** Step indicator at top (progress bar + numbered circles), large `radius-lg` cards per step, generous vertical spacing, "Save & Continue" primary + "Save & Exit" ghost.

### 9.9 Admin Panel (`/admin`)

- **Dashboard:** KPI cards (total users, sellers, bookings, pending approvals), recent activity feed
- **Seller Approval Queue:** Data table with sort/filter, status pills, "Review" action opens detail drawer
- **Detail Drawer:** Full seller profile preview + verification documents (signed Cloudinary URLs) + Approve/Reject with reason
- **Booking Oversight:** Read-only table, search by ID/name/date, link to conversation thread
- **Review Moderation:** Flagged reviews queue, "Remove" (soft delete) / "Dismiss flag" actions

---

## 10. Empty, Loading & Error States — Designed, Not Defaulted

### 10.1 Empty States

| Screen | Empty State Design |
|---|---|
| Search results (no matches) | Illustration + "No results for these filters" + "Clear all" button + "Browse all [category] in Sukkur" suggestion link |
| Customer favorites | Illustration + "You haven't saved any vendors yet" + "Explore venues" CTA |
| Seller requests (new seller) | Illustration + "Your profile is live!" + "Share your profile" + "Add more photos to stand out" |
| Messages (no threads) | Illustration + "No conversations yet" + "Browse sellers to start chatting" |
| Events (no events) | Illustration + "Start planning your first event" + "Create event" CTA |
| Reviews (none left) | "You haven't left any reviews yet. Reviews unlock after a completed booking." |
| Notifications (all read) | "You're all caught up! " + accent icon |

### 10.2 Loading States

- **Skeleton screens** matching real layout — never generic spinners on image-heavy pages
- **Search results:** Card skeletons (16:9 image placeholder + 2 text lines), 6 items
- **Seller profile:** Cover skeleton (16:9) + title skeleton + 3 section skeletons
- **Calendar:** Grid of day skeletons with shimmer
- **Chat:** Bubble skeletons alternating sides
- **Dashboard:** Stat card skeletons (4–5) + list skeletons
- **Shimmer:** `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` sweep animation, 1.5s infinite

### 10.3 Error States

- **404 (`frontend/src/routes/NotFound.jsx`, route `*`):** `ink-950` background, animated illustration (Lottie or CSS), display headline "Page not found", body text, live search bar, links to popular categories and featured sellers. Never a dead end. *(See TRD §13, App Flow §9)*
- **Error boundary (`frontend/src/routes/Error.jsx`):** Friendly tone — "Something went wrong" (not "Error 500"), plain-language explanation, one clear recovery action ("Try again" or "Go home"), dark mode compatible
- **API error (toast):** `error` color, brief message, auto-dismiss 5s, action button if recoverable
- **Network offline:** Sticky banner at top, `warning` bg, "You're offline. Some features may not work."

---

## 11. Accessibility Requirements — Non-Negotiable

- **WCAG 2.1 AA minimum** across the entire product.
- All interactive elements **keyboard-navigable** and screen-reader labeled. shadcn/Radix primitives handle most ARIA by default — do not override.
- **Color is never the only status signal.** Status pills (§5.3) always pair color with text + icon. Colorblind users must read calendar status without relying on hue.
- **Minimum touch target:** 44×44px on all mobile-interactive elements, especially calendar date cells.
- **Form errors:** Announced to assistive tech via `aria-live="polite"` regions, not just visual flags.
- **Focus indicators:** Visible, high-contrast focus rings (2px `primary-500`) on all interactive elements. Never remove default focus styles without replacement.
- **Alt text:** All images have descriptive `alt`. Decorative images use `alt=""`.
- **Heading hierarchy:** Logical `h1` → `h2` → `h3` order, no skips.
- **`prefers-reduced-motion`:** Respected everywhere (§7.2).
- **Screen reader-only text:** Use `sr-only` class for visual context that screen readers need (e.g., "5 stars out of 5" after star rating).

---

## 12. Responsive Breakpoints

Standard Tailwind breakpoints. Build **mobile-first** (base = mobile, add complexity at larger breakpoints).

| Name | Width | Usage |
|---|---|---|
| `base` | 0–639px | Mobile default. Single column, full-width cards, bottom nav, stacked layouts |
| `sm` | 640px+ | Slight layout adjustments, 2-column grids begin |
| `md` | 768px+ | Tablet. Sidebar appears, map+list side-by-side, modal dialogs instead of sheets |
| `lg` | 1024px+ | Desktop. Full sidebar, 3–4 column grids, sticky map, expanded navigation |
| `xl` | 1280px+ | Large desktop. Max-width containers (1280px), generous whitespace, hero text scales up |

**Container max-widths:**
- Public pages: `1280px` centered
- Dashboard content: `1440px` (data-dense)
- Text-heavy pages (FAQ, About): `768px` centered (readable line length)

---

## 13. Design System Implementation — Copy-Paste Ready

Paste this block into `frontend/src/styles/globals.css` (after Tailwind directives) to establish the full token system.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
  /* ── Brand Anchors ── */
  --color-primary: #306998;
  --color-accent: #ffd43b;
  --color-ink: #1a1a2e;
  --color-base: #ffffff;

  /* ── Primary Scale (Baltic Blue) ── */
  --primary-50: #f3f7fb;
  --primary-100: #e7f0f7;
  --primary-200: #d0e1f0;
  --primary-300: #b9d3e8;
  --primary-400: #9ac0df;
  --primary-500: #6ba3d0;
  --primary-600: #306998;
  --primary-700: #27557c;
  --primary-800: #1a3b55;
  --primary-900: #112536;
  --primary-950: #09151f;

  /* ── Accent Scale (Golden Pollen) ── */
  --accent-50: #fffbef;
  --accent-100: #fff8e0;
  --accent-200: #fff1c1;
  --accent-300: #ffeba3;
  --accent-400: #ffe27a;
  --accent-500: #ffd53d;
  --accent-600: #ffd43b;
  --accent-700: #a37f00;
  --accent-800: #705700;
  --accent-900: #473700;
  --accent-950: #281f00;

  /* ── Ink Scale (Space Indigo) ── */
  --ink-50: #f5f5f9;
  --ink-100: #ebebf3;
  --ink-200: #d7d7e8;
  --ink-300: #c4c4dd;
  --ink-400: #aaaacf;
  --ink-500: #8282b9;
  --ink-600: #19192e;
  --ink-700: #3a3a68;
  --ink-800: #282847;
  --ink-900: #19192d;
  --ink-950: #0e0e1a;

  /* ── Semantic ── */
  --color-success: #059669;
  --color-success-light: #d1fae5;
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #fee2e2;
  --color-info: #306998;
  --color-info-light: #e7f0f7;

  /* ── Surfaces (Light Mode) ── */
  --surface-base: #ffffff;
  --surface-raised: #ffffff;
  --surface-sunken: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --border-default: #e2e8f0;
  --border-subtle: #f1f5f9;

  /* ── Radius ── */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  /* ── Shadows (Light) ── */
  --shadow-sm: 0 1px 3px hsla(207, 52%, 20%, 0.06);
  --shadow-md: 0 4px 12px hsla(207, 52%, 20%, 0.08);
  --shadow-lg: 0 8px 24px hsla(207, 52%, 20%, 0.10);
  --shadow-xl: 0 16px 48px hsla(207, 52%, 20%, 0.12);
  --shadow-glow: 0 0 20px hsla(47, 100%, 62%, 0.3);

  /* ── Gradients ── */
  --gradient-trust: linear-gradient(135deg, #27557c, #0e0e1a);
  --gradient-celebrate: linear-gradient(135deg, #ffe27a, #306998);
  --gradient-subtle: linear-gradient(180deg, transparent, rgba(14, 14, 26, 0.6));
  }

  .dark {
  /* ── Surfaces (Dark Mode) ── */
  --surface-base: #0e0e1a;
  --surface-raised: #19192d;
  --surface-sunken: #0e0e1a;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  --border-default: #3a3a68;
  --border-subtle: #282847;

  /* ── Primary shifts for dark contrast ── */
  --color-primary: #6ba3d0;
  --color-info: #6ba3d0;

  /* ── Shadows become borders ── */
  --shadow-sm: inset 0 1px 0 #3a3a68;
  --shadow-md: 0 0 0 1px #3a3a68;
  --shadow-lg: 0 0 0 1px #3a3a68, 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 0 0 1px #3a3a68, 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  /* ── Reduced Motion ── */
  @media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  }
  }
}
```

### 13.1 Tailwind Config Extension

Add to `tailwind.config.js` to map the CSS variables:

```js
theme: {
  extend: {
  colors: {
  primary: {
  50: 'var(--primary-50)', 100: 'var(--primary-100)', 200: 'var(--primary-200)',
  300: 'var(--primary-300)', 400: 'var(--primary-400)', 500: 'var(--primary-500)',
  600: 'var(--primary-600)', 700: 'var(--primary-700)', 800: 'var(--primary-800)',
  900: 'var(--primary-900)', 950: 'var(--primary-950)',
  },
  accent: {
  50: 'var(--accent-50)', 100: 'var(--accent-100)', 200: 'var(--accent-200)',
  300: 'var(--accent-300)', 400: 'var(--accent-400)', 500: 'var(--accent-500)',
  600: 'var(--accent-600)', 700: 'var(--accent-700)', 800: 'var(--accent-800)',
  900: 'var(--accent-900)', 950: 'var(--accent-950)',
  },
  ink: {
  50: 'var(--ink-50)', 100: 'var(--ink-100)', 200: 'var(--ink-200)',
  300: 'var(--ink-300)', 400: 'var(--ink-400)', 500: 'var(--ink-500)',
  600: 'var(--ink-600)', 700: 'var(--ink-700)', 800: 'var(--ink-800)',
  900: 'var(--ink-900)', 950: 'var(--ink-950)',
  },
  surface: {
  base: 'var(--surface-base)',
  raised: 'var(--surface-raised)',
  sunken: 'var(--surface-sunken)',
  },
  },
  fontFamily: {
  fraunces: ['var(--font-fraunces)', 'serif'],
  geist: ['var(--font-geist-sans)', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'monospace'],
  },
  borderRadius: {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  },
  boxShadow: {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  glow: 'var(--shadow-glow)',
  },
  },
},
```

---

## 14. Appendix: State-Color Matrix — Quick Reference

A single source of truth for mapping every status in the system to its visual treatment. *(Cross-reference: App Flow §5 for state machines, Backend Schema §5 for status fields.)*

### 14.1 BookingRequest Status

| Status | Pill Color | Icon | Calendar Color | User Facing Label |
|---|---|---|---|---|
| `pending` | Warning (amber) | Clock | — | "Pending Response" |
| `seller_replied` | Info (blue) | MessageCircle | — | "Seller Replied" |
| `estimate_sent` | Info (blue) | FileText | — | "Estimate Received" |
| `negotiating` | Warning (amber) | MessageSquare | — | "In Negotiation" |
| `accepted` | Warning (amber) | Handshake | Pending (yellow) | "Accepted — Awaiting Deposit" |
| `rejected` | Error (red) | XCircle | — | "Declined" |
| `expired` | Error (red) | AlertTriangle | Available (green) | "Expired" |
| `cancelled` | Slate | Ban | Available (green) | "Cancelled" |

### 14.2 Estimate Status

| Status | Pill Color | Icon | User Facing Label |
|---|---|---|---|
| `draft` | Slate | File | "Draft" |
| `sent` | Info (blue) | Send | "Sent" |
| `viewed` | Info (blue) | Eye | "Viewed" |
| `accepted` | Success (green) | CheckCircle | "Accepted" |
| `rejected` | Error (red) | XCircle | "Rejected" |
| `superseded` | Slate | Layers | "Revised" |
| `expired` | Error (red) | Clock | "Expired" |

### 14.3 Booking Status

| Status | Pill Color | Icon | User Facing Label |
|---|---|---|---|
| `confirmed` | Success (green) | CheckCircle | "Confirmed" |
| `completed` | Primary (blue) | PartyPopper | "Completed" |
| `cancelled_by_customer` | Error (red) | UserX | "Cancelled by Customer" |
| `cancelled_by_seller` | Error (red) | StoreX | "Cancelled by Vendor" |
| `disputed` | Warning (amber) | ShieldAlert | "Under Review" |

### 14.4 Availability Status

| Status | Calendar Cell | Pill Color | Icon | User Facing Label |
|---|---|---|---|---|
| `available` | Green dot/bg | Success | CheckCircle | "Available" |
| `pending` | Amber dot/bg | Warning | Clock | "On Hold" |
| `booked` | Red dot/bg | Error | Lock | "Booked" |
| `blocked` | Gray dot/bg | Slate | Ban | "Unavailable" |

### 14.5 SellerProfile Status

| Status | Pill Color | Icon | User Facing Label |
|---|---|---|---|
| `pending` | Warning (amber) | Hourglass | "Under Review" |
| `approved` | Success (green) | ShieldCheck | "Verified & Live" |
| `rejected` | Error (red) | XCircle | "Needs Changes" |
| `suspended` | Error (red) | AlertOctagon | "Suspended" |

---

## 15. Document Change Log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-08-16 | Initial release. Complete visual language: tokens, typography, spacing, components, motion, screen direction, accessibility, implementation code. Cross-referenced with PRD, TRD, App Flow, Backend Schema, and Implementation Plan. |

---

*End of UI/UX Design Brief*
