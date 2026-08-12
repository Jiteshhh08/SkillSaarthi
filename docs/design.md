# Skill Guide— Product Design Specification

> Design reference: **Khan Academy** (`https://www.khanacademy.org`)
> Theme mode: **Light only**. No dark mode is offered anywhere in the UI.

This document is the single source of truth for the Skill Guideinterface, adapted
from Khan Academy's design system ("Wonder Blocks" lineage). Every screen, component,
token, and interaction in the app must follow the rules below.

---

## 1. Design Intent & Atmosphere

Skill Guidemirrors Khan Academy's **mission-driven warmth**: a paper-white canvas,
a confident **mint green** brand accent, Lato sans-serif throughout, 8px-radius cards,
pill-shaped primary buttons, and progress rendered as **skill mastery** rather than
percentage-watched. The tone is the encouraging tutor who believes anyone can learn.

**Key characteristics**
- Paper-white `#ffffff` canvas; alternate bands warm to `#f7f8fa`.
- Warm cream `#fef9e9` for encouragement/tip callouts and the nonprofit-style ask banner.
- Signature mint `#14bf96` on the brand, primary CTAs, and "mastered" states.
- Deeper green `#0a7d63` for inline links and outlined buttons (AAA contrast on white).
- Lato humanist sans — one family pulls display through body.
- 4-stage mastery indicator: Attempted → Familiar → Proficient → Mastered.
- Energy-points (yellow) and streak (orange) light gamification.
- Flat, hand-drawn-style custom illustrations — no stock photography.
- Donate-blue `#1865f2` reserved for the donation-ask style CTA so it never competes
  with the mint learning-action verbs.
- Light-only. There is **no dark-mode variant** in the web app, per the K-12
  textbook-tradition metaphor.

---

## 2. Color System (Light Mode — the only mode)

### 2.1 Core tokens

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#ffffff` | Primary canvas |
| `bg-warm` | `#f7f8fa` | Alternate section band, hover surface, nav hover |
| `bg-muted` | `#fafbfc` | Subtle background variation |
| `bg-cream` | `#fef9e9` | Encouragement / tip / ask banner |
| `bg-drop` | `#21242c` | Footer dark band, toast background |
| `bg-promo` | `#e3f9f1` | Mint promo band |
| `surface` | `#ffffff` | Default card, modal floor |
| `surface-hover` | `#f7f8fa` | List-row / card hover |
| `surface-soft` | `#f0fcf7` | Mint-tinted secondary card (lesson tile) |
| `surface-strong` | `#e7e9ed` | Divider band |

### 2.2 Text tokens

| Token | Hex | Usage |
|---|---|---|
| `text` | `#21242c` | Primary body — warm near-black |
| `text-strong` | `#0c0d0f` | Hero display headlines only |
| `text-muted` | `#5b5e6b` | Secondary metadata ("12 of 24 skills mastered") |
| `text-soft` | `#797d8a` | Tertiary captions |
| `text-disabled` | `#a8aab2` | Disabled controls, placeholder-on-disabled |
| `text-on-brand` | `#ffffff` | Text on mint brand surface |
| `text-link` | `#0a7d63` | Inline link (deeper green, AAA on white) |
| `text-link-hover` | `#06664f` | Link pressed state |

### 2.3 Brand tokens

| Token | Hex | Usage |
|---|---|---|
| `brand` | `#14bf96` | Primary CTA, wordmark, brand surfaces |
| `brand-hover` | `#0e9a78` | Primary button hover |
| `brand-active` | `#0a7d63` | Pressed state |
| `brand-soft` | `#e3f9f1` | Badge background, mint-tinted callout |
| `brand-deep` | `#0a7d63` | Inline links, outlined-button border, bordered text |

### 2.4 Accent tokens

| Token | Hex | Usage |
|---|---|---|
| `accent-blue` | `#1865f2` | Donate-style CTA, familiar mastery dot, info messages |
| `accent-yellow` | `#f4cf3e` | Energy-points lightning + pill border |
| `accent-orange` | `#e07c2c` | Streak fire + pill border |
| `accent-purple` | `#9059ff` | Proficient mastery dot, avatar tint |
| `accent-red` | `#d23a48` | Error / wrong answer |
| `accent-pink` | `#e879b7` | Mascot (optional AI-tutor) accent |

### 2.5 Neutrals, borders, shadows

| Token | Hex | Usage |
|---|---|---|
| `border` | `#d6d8de` | Default hairline, card borders |
| `border-soft` | `#e7e9ed` | Subtle row dividers |
| `border-strong` | `#a8aab2` | Focused outline before brand ring |
| `border-focus` | `#14bf96` | Focus ring color |
| `shadow-card-rest` | `0 1px 3px rgba(33,36,44,0.06)` | Cards at rest |
| `shadow-card-hover` | `0 4px 12px rgba(33,36,44,0.10)` | Card hover lift |
| `shadow-popover` | `0 4px 16px rgba(33,36,44,0.12)` | Dropdowns, tooltips, mega-menu |
| `shadow-modal` | `0 16px 48px rgba(33,36,44,0.20)` | Modal floor |
| `shadow-ring` | `0 0 0 3px rgba(20,191,150,0.4)` | Focus ring |

All shadows are tinted from the body color `#21242c` (warm grey), never cool grey.

### 2.6 Mastery scale (4 stages)

| Stage | Color | Meaning |
|---|---|---|
| Attempted | `#a8aab2` (grey) | No mastery progress |
| Familiar | `#1865f2` (blue) | First comfort level |
| Proficient | `#9059ff` (purple) | Second level |
| Mastered | `#0a7d63` (deep green) | Final state — echoes brand-deep |

Pills for tiers:
- Mastered: bg `#e3f9f1`, text `#0a7d63`
- Proficient: bg `#f3eaff`, text `#5e2bb1`
- Familiar: bg `#e6efff`, text `#0a44b8`
- Attempted: bg `#f1f2f5`, text `#5b5e6b`

### 2.7 Semantic states

| State | Text color | Background | Usage |
|---|---|---|---|
| Success | `#0a7d63` | `#e3f9f1` | Correct, mastered, "Great job!" |
| Warning | `#d68a17` | `#fef9e9` | "Try again", hint available |
| Danger | `#d23a48` | `#fdebed` | Wrong answer, validation error |
| Info | `#1865f2` | `#e6efff` | Announcements, info banner |

---

## 3. Typography

### 3.1 Font families

- **Primary:** `"Lato", "Lato 2.0", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", Helvetica, Arial, sans-serif` — humanist sans, LOFL-licensed, weights 400 / 700 / 900.
- **Mono:** `"Source Code Pro", "SF Mono", "Roboto Mono", Menlo, Consolas, monospace` — computing courses and inline code.
- **OpenType features:** `kern` and `liga` enabled site-wide. `tnum` on energy points, streaks, learner counts, progress percentages, and any tabular data.

### 3.2 Type scale

| Role | Font | Size | Weight | Line-height | Tracking | Notes |
|---|---|---|---|---|---|---|
| Hero | Lato | 56px | 900 | 1.1 | `-0.02em` | Landing hero |
| Display XL | Lato | 44px | 700 | 1.15 | `-0.015em` | Section hero |
| Display LG | Lato | 32px | 700 | 1.2 | `-0.01em` | Page / course landing title |
| Display MD | Lato | 24px | 700 | 1.25 | `-0.005em` | Section heading |
| Display SM | Lato | 20px | 700 | 1.3 | 0 | Subsection heading |
| Title LG | Lato | 18px | 700 | 1.35 | 0 | Card title |
| Title MD | Lato | 16px | 700 | 1.4 | 0 | Skill title in tree |
| Title SM | Lato | 14px | 700 | 1.4 | 0 | Sidebar nav, lesson list item |
| Body LG | Lato | 18px | 400 | 1.55 | 0 | Lead paragraph / description |
| Body MD | Lato | 16px | 400 | 1.5 | 0 | Default body, question text |
| Body SM | Lato | 14px | 400 | 1.5 | 0 | Secondary metadata |
| Button LG | Lato | 16px | 700 | 1.0 | 0 | Primary CTA label |
| Button MD | Lato | 14px | 700 | 1.0 | 0 | Default button label |
| Eyebrow | Lato | 13px | 700 | 1.0 | `0.08em` | Uppercase "GET STARTED" |
| Caption | Lato | 13px | 400 | 1.4 | 0 | Fine print |
| Metadata | Lato | 14px | 400 | 1.3 | 0 (`tnum`) | Skill counts, points |
| Points | Lato | 16px | 700 | 1.0 | 0 (`tnum`) | "2,340" energy points |
| Code | Source Code Pro | 14px | 400 | 1.5 | 0 | Code, LaTeX fallback |

### 3.3 Principles

- **Single family discipline.** Lato covers display through body. No display-serif companion.
- **Three weights:** 400 body, 700 titles, 900 (Lato Black) hero only.
- **Modest negative tracking** on display sizes only; never tighter than `-0.02em`.
- **Sentence case everywhere except eyebrows.** "Start a new course", "Continue learning".
- **Tabular numerals** for any number that represents progress/currency ("12 of 24", "2,340", "7 day streak", "75%").
- **16px body / 1.5 line-height** baseline for reading content.

---

## 4. Spacing, Radius, Layout

### 4.1 Spacing scale

Base `4px`. Scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128`.

- Card-to-card gap: 24px desktop, 16px tablet, 12px mobile.
- Major section gap: 64–96px.
- Grid gutter: 24px.
- Within-card padding: 16–24px.

### 4.2 Radius

| Token | Value | Use |
|---|---|---|
| micro | 2px | Tiny indicators |
| sm | 4px | Inputs, small buttons, tags |
| md | 6px | Default badge |
| lg | 8px | Cards, buttons — Khan's friendly default |
| xl | 12px | Large cards, modals, encouragement callouts |
| pill | 9999px | Primary button, chips, mastery dots, pills |

### 4.3 Layout

| Token | Value |
|---|---|
| Page width (max) | 1440px |
| Content max | 1240px centred |
| Prose width | 720px |
| Header height | 64px (sticky) |
| Learning-tree sidebar | 280px |
| Card min / max | 240px / 320px |
| Hero min-height | 480px |
| Card grid | 4-across ≥1200px, 3-across ≥900px, 2-across ≥600px, 1-across mobile |

### 4.4 Breakpoints

| Token | px |
|---|---|
| mobile | 600 |
| tablet | 900 |
| desktop | 1200 |
| wide | 1440 |

---

## 5. Components

### 5.1 Buttons

**Primary (mint pill)** — the only saturated action per viewport.
- bg `#14bf96`, text `#ffffff`, radius `9999px`, padding `12px 24px`, height 48px, Lato 16/700.
- Hover `#0e9a78`; active `#0a7d63`. No shadow lift, no scale.
- Uses: "Start", "Continue", "Practice this skill", "Get started".

**Secondary (outlined deep green)** — "Learn more", "Sign in".
- bg `#ffffff`, text `#0a7d63`, border `2px solid #0a7d63`, radius `9999px`, padding `12px 24px`.
- Hover bg `#e3f9f1`.

**Tertiary (text)** — inline actions.
- transparent bg, text `#0a7d63`, padding `8px 12px`; hover underline.

**Donate-style (blue pill)** — reserved for nonprofit-ask CTA.
- bg `#1865f2`, text `#ffffff`, radius `9999px`, padding `12px 24px`, height 48px. Hover `#0d4ec7`.

**Icon button** — bookmark/share/more.
- 32×32 transparent, text `#5b5e6b`, radius 4px; hover bg `#f7f8fa`, text `#21242c`.

### 5.2 Cards & tiles

**Subject tile**
- bg `#ffffff`, radius 8px, padding 24px, border `1px solid #d6d8de`, rest shadow card.
- Flat illustration top (96px), 18/700 name, 14/400 muted description (≤2 lines), metadata "X skills".

**Skill card (learning-tree row)**
- bg `#ffffff`, radius 8px, padding 16px, border `1px solid #d6d8de`.
- Mastery dot (24px) left, skill title (16/700) centre, tier pill right.
- Hover bg `#f7f8fa`.

**Lesson tile**
- bg `#f0fcf7`, radius 8px, padding 16px, border `#d6d8de`.
- Type icon (video/exercise/article) left, title centre, runtime/count right.

**Encouragement callout**
- bg `#fef9e9`, radius 12px, padding 24px, border `1px solid #f4cf3e`.
- "Tip!" / "Did you know?" / "Recommended for you" style message.

**Ask / donate banner**
- bg `#fef9e9`, border `1px solid #f4cf3e`, radius 8px, padding 16px, dismissible.

### 5.3 Badges & indicators

- Mastery tier pills: 9999px radius, padding `4px 12px`, 12/700 (colors in §2.6).
- **Mastery dot:** 24px circle, progress arc renders current stage; animated fill on correct answers. Colors in §2.6.
- **Energy-points pill:** bg `#fef9e9`, text `#a06c0a`, border `#f4cf3e`; "⚡ 2,340" with `tnum`.
- **Streak pill:** bg `#fef0e7`, text `#9d5511`, border `#e07c2c`; "🔥 7 day streak".
- **Filter chip:** default white + `#d6d8de` border; active bg `#e3f9f1`, text `#0a7d63`, border `#14bf96`.

### 5.4 Inputs & forms

**Search** — bg `#f7f8fa`, radius 8px, height 48px, padding `12px 16px 12px 44px`, magnifier left in `#5b5e6b`, placeholder "Search Skill Guide". Focus ring brand.

**Text input** — bg `#ffffff`, border `1px solid #d6d8de`, radius 8px, height 48px, padding `12px 16px`. Label above 14/700; hint below 13/400 muted. Focus ring brand.

**Exercise answer input** — bg `#ffffff`, border `2px solid #d6d8de`, radius 8px, height 56px. Correct → border `#14bf96` + 600ms celebration; incorrect → border `#d23a48` + "Try again" hint.

### 5.5 Navigation

**Top bar (sticky, 64px)**
- bg `#ffffff`, border-bottom `1px solid #d6d8de`.
- Logo left; primary nav; search centre; "Sign in" + blue donate pill right.
- Logged in: avatar, energy-points pill, streak pill.
- Mobile: hamburger + search icon + donate.

**Learning-tree sidebar (280px)**
- bg `#ffffff`, padding `24px 16px`, sticky.
- Collapsible unit groups; each shows title, muted "12 of 24 skills mastered", thin mint progress bar.

**Mega menu (Courses)**
- bg `#ffffff`, shadow popover; multi-column by level then subject.

### 5.6 Modals & toasts

- **Modal:** bg `#ffffff`, radius 12px, padding 32px, shadow modal, backdrop `rgba(33,36,44,0.5)`.
- **Toast:** bg `#21242c`, text `#ffffff`, radius 8px, padding `12px 16px`, bottom-left, 3s auto-dismiss.
- **Encouragement toast:** bg `#e3f9f1`, text `#0a7d63`, border-left `4px solid #14bf96`.

---

## 6. Page Layouts

### 6.1 Landing / Home

1. Sticky top bar.
2. Hero: Lato 56/900 headline, 18px lead, mint primary CTA + outlined secondary.
3. "What would you like to learn?" subject tile grid (Math, Science, Computing, Arts & humanities, Economics, Reading & language arts, Life skills, Test prep — mapped to Skill Guidesubjects).
4. "Recommended for you" rail (authenticated; otherwise "Popular careers").
5. Encourage-the-learner mint band (e.g. "Every journey starts with one skill").
6. Warm-cream ask banner ("Help us keep Skill Guidefree").
7. "Trusted by" partner rail (muted greys).
8. Footer: 4-column `#21242c` dark band.

### 6.2 Course / Career detail

- 280px learning-tree sidebar + content column.
- Header: subject illustration, 32/700 title, 18/400 description, mint CTA.
- Skill rows each carry a mastery dot + tier pill.
- Units with progress bars; lesson tiles below.

### 6.3 Practice / Assessment

- Centred exercise surface (prose width 720px).
- Question in 16/400; answer input 56px with 2px border.
- Encouragement toast on streaks, correct/wrong states, celebration on complete.

### 6.4 Profile

- Avatar circle (purple tint `#9059ff`), display name, education level selector.
- Energy points + streak pills.
- Skill mastery list and roadmap overview.

---

## 7. Motion

| Token | Value |
|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `duration-fast` | 150ms |
| `duration-standard` | 250ms |
| `duration-slow` | 400ms |
| `duration-celebration` | 600ms (confetti on completion) |

`prefers-reduced-motion` honored: hover shadow lifts become instant, mastery-dot fill becomes opacity-only, celebration/disables confetti.

---

## 8. Accessibility

- `#21242c` on `#ffffff`: contrast 14.2 (AAA).
- `#5b5e6b` on `#ffffff`: 6.4 (AA at body).
- White on `#14bf96`: 2.6 — used only at 16px/700+ (large-text bracket).
- Links use deep green `#0a7d63` (7.4, AAA) or blue `#1865f2` (6.6, AA).
- Focus ring: `0 0 0 3px rgba(20,191,150,0.4)` with 2px offset.
- All interactive elements reachable and operable via keyboard.
- Screen-reader-friendly labels on icons; captions/transcripts alongside video where applicable.

---

## 9. Theme & Mode Policy

- **Light mode is the only mode.** No dark-mode variant exists in the web app.
- Rationale: long-form reading and practice are best on light backgrounds; the paper-white
  canvas echoes the K-12 textbook tradition that defines the brand metaphor.
- The only "dark" surface allowed is the footer band `#21242c` and the default toast
  `#21242c` — both are intentional inversions within the light system, not themes.
- Do not ship a theme toggle. Do not introduce `prefers-color-scheme: dark` handling.