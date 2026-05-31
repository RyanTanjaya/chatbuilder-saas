# Handoff: ChatBuilder — No-Code AI Chatbot Platform

## Overview
ChatBuilder is a no-code SaaS web app where anyone can create custom AI chatbots trained on
their own documents (PDF / TXT / DOCX) and embed them on any website. This bundle contains a
**fully interactive, 9-screen high-fidelity prototype** covering auth, dashboard, chatbot
training, live chat, embedding, public widget, analytics, and settings.

Reference quality bar: **Intercom, Crisp, Linear**.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** —
prototypes showing the intended look, layout, and behavior. They are **not production code to copy
directly**.

Your task is to **recreate these designs in the target stack: React + TypeScript + Tailwind CSS +
shadcn/ui**, using that ecosystem's established patterns (shadcn primitives, `cn()` helper,
Tailwind theme tokens, lucide-react icons). Treat the HTML as the source of truth for visual
design, copy, spacing, and interaction; map every primitive to its shadcn equivalent rather than
porting the raw CSS.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, and interactions are final.
Recreate the UI pixel-accurately using shadcn/ui components themed with the tokens below. All copy
in the prototype is the intended copy.

---

## Target Stack & Library Mapping

| Prototype element | Use in production |
|---|---|
| Inline SVG icons (`app/icons.jsx`) | **`lucide-react`** — exact icon names are listed per screen below (MessageSquare, Plus, Upload, FileText, Trash2, Settings, Code, BarChart3, Sparkles, Search, Send, Paperclip, X, ChevronRight, LayoutDashboard, Bot, MessagesSquare, User, LogOut, Copy, Check, TrendingUp, TrendingDown, Clock, Users, Menu, Globe, Zap, Mail, Lock, Image, CreditCard, ArrowLeft) |
| `.btn` variants | shadcn **`Button`** (`variant`: default / outline / ghost / destructive; `size`: default / sm / lg) |
| `.input`, `.textarea` | shadcn **`Input`**, **`Textarea`** |
| `.card` | shadcn **`Card`** / `CardHeader` / `CardContent` |
| `.toggle` | shadcn **`Switch`** |
| `.slider` | shadcn **`Slider`** |
| `.checkbox` | shadcn **`Checkbox`** |
| `.pill`, `.chip`, `.badge` | shadcn **`Badge`** (add custom variants) |
| `.tbl` (analytics table) | shadcn **`Table`** |
| Position / accent toggles | shadcn **`ToggleGroup`** or **`Tabs`** |
| Sidebar nav | shadcn **`Sidebar`** (or a custom flex column) |
| Charts (`app/stats.jsx`) | **Recharts** (`LineChart` + `Area`, `BarChart` horizontal). The prototype hand-rolls SVG — replace with Recharts using the same data + colors. |
| Drag-and-drop upload | **`react-dropzone`** styled to match `.dropzone` |
| Copy-to-clipboard | `navigator.clipboard.writeText` (already used) |
| Routing | **React Router** (or Next.js App Router). Route table below. |
| Fonts | **Inter** (UI) + **Fira Code** (code blocks) via `next/font` or `@fontsource` |

---

## Design Tokens

Add to `tailwind.config.ts` `theme.extend` (and mirror as CSS variables for shadcn). These are the
exact values used in the prototype (`styles.css` `:root`).

```ts
colors: {
  primary:      { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#e0e7ff' }, // indigo
  navy:         { DEFAULT: '#0f172a', 800: '#1e293b', 700: '#334155' },
  text:         { DEFAULT: '#334155', strong: '#0f172a', muted: '#64748b' },
  surface:      '#ffffff',
  bg:           '#f8fafc',
  border:       { DEFAULT: '#e2e8f0', strong: '#cbd5e1' },
  success:      '#10b981',
  warning:      '#f59e0b',
  danger:       '#ef4444',
  accent:       '#8b5cf6', // purple
},
borderRadius: {
  card:  '12px',
  btn:   '9px',
  input: '9px',
  pill:  '999px',
},
boxShadow: {
  sm:  '0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.04)',
  md:  '0 4px 12px rgba(15,23,42,.06), 0 2px 4px rgba(15,23,42,.04)',
  lg:  '0 12px 32px rgba(15,23,42,.12), 0 4px 8px rgba(15,23,42,.06)',
  pop: '0 24px 60px rgba(15,23,42,.18)',
}
```

**Chatbot accent palette** (avatar circles, widget themes, swatch picker) — each bot has one:

| key | bg | soft (chip/icon bg) | text |
|---|---|---|---|
| indigo | `#6366f1` | `#e0e7ff` | `#4f46e5` |
| purple | `#8b5cf6` | `#ede9fe` | `#7c3aed` |
| green  | `#10b981` | `#d1fae5` | `#047857` |
| amber  | `#f59e0b` | `#fef3c7` | `#b45309` |

**Status soft fills:** success `#d1fae5`, warning `#fef3c7`, danger `#fee2e2`, purple `#ede9fe`.

**Typography**
- Font family: **Inter** (400/500/600/700/800), fallback system sans.
- Mono: **Fira Code** (code blocks only).
- H1 (page title): 22px / 800 / -0.02em. Auth H1: 24px / 800.
- Section title: 16px / 700. Card title: 15px / 700.
- Body: 14px / 1.5. Muted/help: 12–13px. Stat numbers: 26–28px / 800 / -0.02em.

**Spacing:** 8px base grid. Card padding 22px. Content padding 28px 32px. Grid gaps 16–24px.

**Layout shell**
- Sidebar: fixed, **260px**, navy `#0f172a`, white nav text, **3px indigo left-border on active**
  item with `rgba(99,102,241,.16)` fill. Collapses (translateX(-100%)) below 860px behind a
  hamburger + scrim.
- Main: `margin-left: 260px`. Sticky translucent topbar (blur). Dashboard is full-bleed; detail/
  settings views are constrained to **max-width 880px** (`.content-narrow`).

---

## Routing

State-based in the prototype (`app/router.jsx`, persisted to `localStorage` key `chatbuilder_nav`).
Suggested production routes:

| Route | Screen | Auth |
|---|---|---|
| `/login` | Login | public |
| `/register` | Register | public |
| `/` or `/dashboard` | Dashboard | private |
| `/chatbots/:id` | Chatbot Detail | private |
| `/conversations` | Conversations / Chat | private |
| `/chatbots/:id/embed` (or `/embed`) | Embed | private |
| `/preview/:id` | Public Widget preview | private |
| `/analytics` | Analytics | private |
| `/chatbots/:id/settings` | Chatbot Settings | private |
| `/account` | Account | private |

---

## Screens

### 1. Login (`/login`)
- **Purpose:** Returning user signs in.
- **Layout:** Centered white card (max-width **410px**, radius 16px, shadow-lg, padding 34px) on
  `#f8fafc` with a faint radial indigo/purple glow background. Vertically centered viewport.
- **Components (top→bottom):**
  - Wordmark: 34px indigo rounded-square logo (MessageSquare icon) with a small yellow Sparkles
    badge at its top-right corner; "Chat**Builder**" wordmark (19px/800, navy).
  - H1 "Welcome back" (24px/800, centered). Sub "Sign in to your chatbot dashboard" (muted).
  - Email field (Mail icon prefix). Password field (Lock icon prefix) with "Forgot password?"
    link aligned right of the label (indigo).
  - Full-width indigo **Sign in** button (44px tall). Shows "Signing in…" then routes to dashboard.
  - Divider with centered "or".
  - Full-width outline **Continue with Google** button (multicolor Google G svg).
  - Footer: "Don't have an account? **Sign up**" (link → register).
- **Validation:** email regex + non-empty password on submit; red border + 12px danger helper text.

### 2. Register (`/register`)
- Same centered-card style as Login.
- H1 "Create your account", sub "Start building AI chatbots in minutes".
- Fields: Full name, Email, Password (helper "At least 8 characters").
- Checkbox row: "I agree to the **Terms** and **Privacy Policy**" (indigo links).
- Full-width indigo **Create account** button → dashboard. Divider + **Continue with Google**.
- Footer: "Already have an account? **Sign in**".
- **Validation:** name ≥ 2 chars, valid email, password ≥ 8 chars, checkbox required.

### 3. Dashboard (`/dashboard`)
- **Purpose:** Overview + entry to every chatbot.
- **Topbar:** H1 "Your Chatbots" + sub "Manage, train, and deploy your AI assistants"; right side:
  search input (Search icon, 240px) + prominent indigo **+ New Chatbot** button.
- **Stat tiles:** 4-up grid (`repeat(4,1fr)`, gap 16). Each: 38px soft-tinted rounded icon, 28px/800
  number, 13px muted label, small green trend ("+18% this month", TrendingUp icon).
  Tiles: Total Chatbots (6), Total Documents (32), Messages This Month (1,114), Active
  Conversations (24).
- **Chatbot grid:** 3-up (`repeat(3,1fr)`, gap 20), collapses 2→1 responsively. Card (radius 12,
  shadow-sm, hover: lift + shadow-md):
  - 48px accent-colored avatar circle (Bot icon, color varies indigo/purple/green/amber).
  - Bot name (16px/700), description (13px muted, 2-line min-height).
  - Two chips: "📄 {n} docs" (FileText), "💬 {n} msgs" (MessageSquare).
  - Bottom row: indigo **Open** (→ detail) + outline **Settings** (Settings icon → settings).
  - Six bots: Support Bot, Sales Assistant, Docs Helper, Onboarding Bot, HR FAQ (draft), Pricing Bot.
  - **Final slot:** dashed empty card "+ Create new chatbot" (hover → indigo tint).
- Search filters cards live by name/description; empty state message when no match.

### 4. Chatbot Detail (`/chatbots/:id`)
- **Topbar:** breadcrumb "Chatbots › {name}"; H1 {name} + small green **Live** pill (animated dot
  ring); right actions: outline **Embed**, outline **Settings**, danger-outline **Delete**.
- **Two-column split** `grid-template-columns: 2fr 3fr` (40% / 60%); stacks to 1 column < 860px.
  - **Left — Knowledge Base card:** title + sub. **Dropzone** at top (dashed, Upload icon in soft
    indigo tile, "Drop PDF, TXT, or DOCX here, or click to browse", "Up to 25 MB per file"); drag
    state highlights indigo; clicking opens a real file input. Below: uploaded doc rows = colored
    FileText icon (pdf=red, docx=indigo, txt=slate) + filename (14/600) + meta "{size} · {n} chunks
    · {TYPE}" + trash button (hover red). Footer summary "{n} documents · {n} chunks". Adding/
    removing docs updates state + the count live.
  - **Right — Test your bot card** (fixed height ~620px): header "Test your bot" + sub + green
    **Online** pill. Scrollable message list seeded with a bot welcome, a user question, and a bot
    reply with a **Sources: refund-policy.pdf** citation chip. Sticky input with auto-growing
    textarea + indigo paper-plane **Send** button. Sending a message echoes a **canned, keyword-
    matched bot reply after a typing animation** (see Interactions).

### 5. Conversations / Chat Interface (`/conversations`)
- **Purpose:** Inbox of live/recent chats + the full chat component.
- **Layout:** single card, `grid-template-columns: 320px 1fr`, height 640.
  - **Left inbox:** "Recent" header + count badge; list rows = accent bot avatar + bot name + last-
    activity time + truncated first message; selected row has indigo-light bg.
  - **Right thread:** header with bot avatar, name, green dot + "Started … · N messages", ghost
    Settings button. Full **chat component**: 6–8 alternating bubbles — **user bubbles = indigo bg /
    white text / right-aligned**; **bot bubbles = `#f1f5f9` / dark text / left-aligned with 30px bot
    avatar**; citation chips under sourced bot replies; **typing… state = 3 dots blinking** appears
    while a reply is generating. Attachment (Paperclip) + textarea + Send input row.

### 6. Embed (`/embed` or `/chatbots/:id/embed`)
- H1 "Embed your chatbot on any website" + sub. Right action: outline **Full preview** (→ widget).
- **Two columns** (`grid-2`, stacks < 860):
  - **Left — Install snippet card:** dark navy code block (radius 12) with a header row
    (`index.html` filename in Fira Code + **Copy** button that flips to green "Copied" with Check
    for ~1.6s). Code is syntax-tinted:
    `<script src="https://api.chatbuilder.app/widget.js" data-chatbot-id="bot_abc123"></script>`
    (tag pink `#f472b6`, attr sky `#7dd3fc`, string amber `#fde68a`, punctuation slate). Below: a
    numbered steps `<ol>` (indigo-light numbered badges): 1 Copy the snippet · 2 Paste before
    `</body>` · 3 Save and refresh.
  - **Right — Live preview card:** "Bubble / Open" segmented toggle. A mock website frame (browser
    dots bar + skeleton lines) with the widget anchored bottom-right (respecting position setting):
    **Bubble** = 56px indigo FAB (MessageSquare); **Open** = a compact open chat panel with header,
    two messages, and a "Powered by ChatBuilder" footer.
- **Settings card (full width below):** Position toggle (bottom-right / bottom-left), accent color
  **swatch picker** (4 accents, selected = ring) showing hex, allowed-domains textarea
  ("example.com, app.example.com") + helper. Position/accent changes update the live preview.

### 7. Public Chat Widget (`/preview/:id`)
- Standalone showcase of the embeddable widget (no app chrome inside the widget itself).
- Two states side by side:
  - **Collapsed:** mock site frame with a 56px floating indigo FAB bottom-right.
  - **Expanded:** **≈ 380 × 600** panel (radius 18, shadow-pop): indigo header with bot avatar +
    name + green-dot **Online** + close X; scrollable message area (welcome + a couple exchanges
    with a citation chip); sticky input with Send; tiny muted **"Powered by ChatBuilder"** footer.
    Fully interactive (canned replies).

### 8. Analytics (`/analytics`)
- H1 "Analytics" + sub "Performance across all your chatbots — last 30 days". Right: outline
  **Conversations** button.
- **KPI row:** 4-up. Each: label, 26px/800 number, footer row with trend badge (green up / red down;
  **Avg response time treats *down* as good**) + a **sparkline** (area + line, accent-colored).
  KPIs: Messages 6,284 (+12.4%), Conversations 1,847 (+8.1%), Avg response time 1.3s (−5.6%),
  Active users 942 (+3.2%).
- **Line chart card:** "Messages over time / Last 30 days" + "+18% vs prior period" chip. 30-point
  indigo area+line chart with y gridlines, axis labels (30d ago / 20d / 10d / Today), dot markers
  every 5th point. → **Recharts AreaChart**.
- **Bar chart card:** "Messages per chatbot" — horizontal bars per bot (accent-colored), value label
  at bar end, name label left. → **Recharts horizontal BarChart**.
- **Recent Conversations table:** columns Chatbot (avatar + name) / First message / Started /
  Messages (chip) / Last activity. 8 rows. Row hover tint. → shadcn Table.

### 9. Chatbot Settings (`/chatbots/:id/settings`)
- Breadcrumb "Chatbots › {name} › Settings" + H1 "Chatbot Settings". Max-width 880 (narrow).
- Section cards (each with a soft indigo icon tile + title + sub):
  - **General:** Name input, Description textarea (helper "Shown on your dashboard card."), Welcome
    message textarea.
  - **Appearance:** Avatar uploader (accent preview tile + outline "Upload image" + helper), accent
    color swatch picker + read-only hex field, widget position toggle (bottom-right / bottom-left).
  - **Behavior:** **"Answer only from documents"** Switch (on by default) with sub; **Conversation
    memory** Slider 1–20 (default **10**, value pill "{n} msgs"); **Temperature** Slider 0–1 step
    0.05 (default 0.30, mono value pill).
  - **Danger zone:** red-bordered (`#fecaca`) card on `#fff5f5`, "Delete this chatbot" + warning +
    solid red **Delete chatbot** button.
- **Sticky save bar** (bottom, blur): Cancel (ghost) + indigo **Save changes** (Check icon),
  **disabled until a field changes**; on save shows a green "Saved" pill briefly.

---

## Interactions & Behavior
- **Auth:** client-side validation on submit (regex email, password length, agree checkbox); 600ms
  fake delay then navigate to dashboard. Replace with real auth.
- **Live chat (test, conversations, widget):** on send → append user bubble, clear + reset textarea
  height, after ~250ms show **typing** bubble (3 blinking dots, `@keyframes blink`), after ~1.5s
  replace with a bot reply chosen by **keyword match** (`refund`, `ship`, `price/plan`, `start`…)
  with source citation chips; fallback reply otherwise. In production wire this to your RAG/LLM
  endpoint and stream tokens; keep the typing indicator and citation chips.
- **Textarea:** auto-grows to max 110px; Enter sends, Shift+Enter newlines.
- **Upload:** drag-over highlights the dropzone; drop or browse adds rows (derives type from
  extension, size in KB, ~size/6 chunks). Trash removes a row. Footer count is derived.
- **Copy snippet:** writes to clipboard, button → green "Copied" + Check for 1.6s.
- **Dashboard search:** live case-insensitive filter over name + description.
- **Settings:** every control marks the form dirty (enables Save); Save clears dirty + flashes
  "Saved". Sliders/Switch are controlled state.
- **Embed preview:** Bubble/Open toggle + position + accent update the mock instantly.
- **Transitions:** screen mounts use a 0.3s `fadeIn` (translateY 6px). Buttons depress 0.5px on
  active. Cards lift on hover. Honor `prefers-reduced-motion` in production.

## Responsive
- Desktop-first. Sidebar fixed 260px ≥ 860px; below, it slides off-canvas behind a hamburger +
  dark scrim. Grids step down: stat/KPI 4→2→2, bots 3→2→1. Detail split and 2-col layouts collapse
  to one column. Widget panel goes full-width on narrow screens. Min hit target 44px.

## State Management
- Prototype uses local React state + a `localStorage`-persisted nav object. In production:
  - **Server state:** chatbots, documents, conversations, analytics, settings → React Query / RTK
    Query against your API.
  - **Auth/session:** your provider (e.g. NextAuth, Clerk, custom).
  - **Local UI state:** sidebar open, form dirtiness, chat input, toggles/sliders.
  - **Data shapes** are in `app/data.jsx` (bots, docs, sample chat, canned replies, KPIs, 30-day
    series, per-bot totals, conversations) — use as TypeScript interface seeds.

## Assets
- **No external image assets.** Icons are Lucide (use `lucide-react`). The Google "G" is an inline
  multicolor SVG (recreate or use a brand icon pkg). Avatars/illustrations are CSS shapes +
  Lucide Bot icons. Fonts: Inter + Fira Code (Google Fonts).

## Files in this bundle
- `ChatBuilder.html` — entry; loads fonts, React/Babel, and the `app/*.jsx` modules.
- `styles.css` — **all design tokens + component styles** (the canonical source for visual specs).
- `app/icons.jsx` — Lucide icon path set (names map 1:1 to `lucide-react`).
- `app/data.jsx` — mock data + TypeScript-able shapes.
- `app/shell.jsx` — Sidebar, Shell (topbar/layout), Button/Field/Avatar/StatTile/Toggle/Sparkline.
- `app/auth.jsx` — Login + Register.
- `app/dashboard.jsx` — Dashboard + BotCard.
- `app/chat.jsx` — Message, LiveChat (typing + canned replies), StaticThread.
- `app/detail.jsx` — Chatbot Detail (knowledge base + chat test).
- `app/conversations.jsx` — Conversations inbox + chat.
- `app/embed.jsx` — Embed (code block, preview, settings).
- `app/widget.jsx` — WidgetPanel + public widget showcase.
- `app/stats.jsx` — Analytics (hand-rolled charts → port to Recharts).
- `app/settings.jsx` — Chatbot Settings.
- `app/account.jsx` — Account.
- `app/router.jsx` — screen registry + navigation + persistence.

> To run the prototype: open `ChatBuilder.html` via a static server (it fetches `app/*.jsx`).
