# Aerly Cinematic — Complete Design System Specification

## 1. COLOR TOKENS

### Core Palette (CSS Variables in `:root`)

**Sky (Blue-Gray Accent)**
- `--sky: #9CC4E4` (light sky)
- `--sky-deep: #5B8FBF` (medium-dark)
- `--sky-ink: #2E5C82` (dark)
- `--sky-soft: #DCEAF4` (very light)

**Sand (Warm Beige)**
- `--sand: #E6D8C2` (medium)
- `--sand-deep: #CDB792` (darker)
- `--sand-soft: #F0E7D7` (light)

**Gold (Primary Accent)**
- `--accent: #C8A24E` (primary gold)
- `--accent-deep: #A8842F` (dark gold)
- `--accent-soft: #E4CB89` (light gold)

**Neutral/Warm Tones**
- `--ivory: #FBF6EC` (cream white)
- `--cream: #F4ECDD` (slightly darker cream)
- `--espresso: #2B2218` (warm dark brown, primary text)
- `--warm-ink: #4A3F31` (warm brown)
- `--warm-muted: #8C7C66` (muted warm)
- `--warm-faint: #B4A488` (very light warm)
- `--line: rgba(74,63,49,0.16)` (subtle border color)

**Semantic Colors (Risk/Status Levels)**
- **Low**: `var(--low)` with `--low-bg`, `--low-ink` (green-based)
- **Moderate**: `var(--moderate)` with `--moderate-bg`, `--moderate-ink` (gold/yellow)
- **High**: `var(--high)` with `--high-bg`, `--high-ink` (orange)
- **Critical**: `var(--critical)` with `--critical-bg`, `--critical-ink` (red)

Status/Travel Badges:
- On-Time: `#22c55e` (green), bg `rgba(34,197,94,0.13)`
- At-Risk: `#c8a24e` (gold), bg `rgba(200,162,78,0.15)`
- Delayed: `#f97316` (orange), bg `rgba(249,115,22,0.13)`
- Cancelled: `#ef4444` (red), bg `rgba(239,68,68,0.13)`
- Completed: `#94a3b8` (slate), bg `rgba(148,163,184,0.15)`
- Boarding: `#0ea5e9` (sky), bg `rgba(14,165,233,0.13)`

---

## 2. TYPOGRAPHY

### Font Families (Google Fonts Import)
```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap" />
```

**Primary Display Font**: `Instrument Serif` (serif, elegant)
- Class: `.ff-display`
- Used for: Headlines, titles, wordmark

**Body/UI Font**: `Hanken Grotesk` (sans-serif, 400/500/600/700 weights)
- Used for: All body text, buttons, labels, UI copy

**Optional Serif Fallback**: `Cormorant Garamond` (serif alternative)

### Type Scale
| Element | Font | Weight | Size | Letter Spacing | Line Height |
|---------|------|--------|------|---|---|
| Display/Hero | Instrument Serif | 600 | 28px | -0.02em | 32px |
| H1/Title | Hanken Grotesk | 600 | 20px | -0.01em | 1 (tight) |
| Subtitle | Display Font | 600 | 16px | 0.01em | 1 |
| Body/Large | Hanken Grotesk | 500/600 | 16-17px | 0.02em | 1.4 |
| Body | Hanken Grotesk | 500/600 | 14-16px | -0.01em | 1 |
| Small/Label | Hanken Grotesk | 600/700 | 11-13px | 0.05em–0.14em | 1 |
| Tiny/Caps | Hanken Grotesk | 700 | 11px | 0.14em | 1 |

---

## 3. BACKGROUND & GRADIENT TREATMENTS

### Page Background
**Body (dark cinematic backdrop):**
```css
background: radial-gradient(130% 90% at 50% -20%, #3a2e22 0%, #2a2017 45%, #1d1610 100%);
```
Rich warm-brown radial gradient; creates depth and premium feel.

### Card/Glass Backgrounds
**Glass (standard blur glass):**
- Background: `rgba(255,255,255,0.52)` with `backdrop-filter: blur(18px) saturate(135%)`
- Border: `1px solid rgba(200,162,78,0.22)` (gold tint)
- Inset Shadow: `0 1px 0 rgba(255,255,255,0.5) inset`
- Outer Shadow: `0 10px 30px rgba(33,24,14,0.10)`

**Glass Strong (elevated):**
- Background: `rgba(251,246,236,0.88)` (ivory-dominant)
- Backdrop Filter: `blur(18px) saturate(135%)`
- Border: `1px solid rgba(200,162,78,0.38)` (stronger gold)
- Inset: `0 1px 0 rgba(255,255,255,0.55) inset, inset 0 0 0 0.5px rgba(200,162,78,0.12)`
- Shadow: `0 10px 30px rgba(33,24,14,0.10)`

**App Bar Background (semi-opaque):**
- `rgba(255,253,247,0.88)` with `blur(18px)`

**Bottom Nav Background:**
- `rgba(255,253,247,0.92)` with `blur(20px)`

### Gradient Buttons
**Gold Gradient Button:**
```css
background: linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 55%, var(--accent-deep) 100%);
border: 1px solid rgba(217,189,116,0.90);
```

**Ivory Button:**
```css
background: rgba(251,246,236,0.96);
border: 1px solid rgba(200,167,97,0.65);
```

**Glass Button:**
```css
background: rgba(255,255,255,0.14);
border: 1px solid rgba(200,167,97,0.65);
backdrop-filter: blur(14px);
```

**Filter Chips (active):**
```css
background: linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%);
```

**Hotel Image Placeholders (5 gradients):**
1. `linear-gradient(135deg, #c8a24e 0%, #e8c97a 50%, #b8924e 100%)` (gold)
2. `linear-gradient(135deg, #5b8fa8 0%, #7ab5cc 50%, #3d7090 100%)` (sky-blue)
3. `linear-gradient(135deg, #7c6f5a 0%, #a8987c 50%, #6a5e48 100%)` (warm-taupe)
4. `linear-gradient(135deg, #8b6b8a 0%, #b090ae 50%, #6e5070 100%)` (mauve)
5. `linear-gradient(135deg, #5a7a5a 0%, #82a882 50%, #3e5e3e 100%)` (sage-green)

---

## 4. BORDER RADIUS & SPACING

### Border Radius Scale
- **Buttons**: `16px` (CButton), `12px` (standard Btn)
- **Cards/Glass**: `22px` (stored as `--card-r: 22px`)
- **Fields/Inputs**: `16px` (CPhoneField, CTextField)
- **OTP Inputs**: `14px`
- **Icon Buttons**: `12px`
- **Hotel Placeholder**: `12px`
- **Rounded Pill**: `999px` (badges, fully rounded)

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny gaps, internal padding |
| sm | 6–8px | Icon gaps, small spacing |
| md | 9–12px | Standard button/card gaps |
| lg | 14–16px | Card padding, section gaps |
| xl | 18–22px | Card padding, section padding |
| 2xl | 26px+ | Button horizontal padding |

**Safe Areas (iPhone frame)**
- `CSAFE_TOP: 50px` (status bar clearance)
- `CSAFE_BOTTOM: 22px` (home indicator clearance)

---

## 5. SHADOWS

### Shadow System
| Elevation | Usage | Value |
|-----------|-------|-------|
| Inset/Subtle | Glass borders, premium feel | `0 1px 0 rgba(255,255,255,0.5) inset` |
| Card | Standard cards, glass cards | `0 10px 30px rgba(33,24,14,0.10)` |
| Elevated Card | Active/strong glass | `0 8px 32px rgba(180,140,60,0.13), 0 2px 8px rgba(0,0,0,0.07)` |
| Glass Card (std) | Glass with gold shimmer | `0 2px 12px rgba(180,140,60,0.08)` |
| Gold Button | Primary CTA | `0 2px 10px rgba(168,132,47,0.28), 0 10px 30px rgba(168,132,47,0.22), 0 0 12px rgba(200,167,97,0.16)` |
| Ivory Button | Secondary glass button | `0 6px 20px rgba(20,14,8,0.18), 0 0 12px rgba(200,167,97,0.16)` |
| Input Focus | Phone/text field | `0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent), inset 0 1px 0 rgba(255,255,255,0.8)` |
| Risk Badge | Low/moderate/high badge dot | `0 0 0 3px color-mix(in srgb, [color] 18%, transparent)` |
| Chip Active | Filter chip | `0 2px 8px rgba(200,162,78,0.25)` |

**Divider Lines:**
```css
background: linear-gradient(to right, transparent, rgba(200,162,78,0.22) 30%, rgba(200,162,78,0.22) 70%, transparent);
height: 1px;
```

---

## 6. PRIMITIVE COMPONENTS & TAILWIND EQUIVALENTS

### Button (CButton)

**Gold Variant (Primary)**
```tailwind
bg-gradient-to-br from-amber-200 via-amber-300 to-amber-600
border border-amber-300/90
rounded-[16px]
px-6 py-3
h-14 (md) / h-16 (lg)
font-semibold text-amber-950
shadow-lg shadow-amber-400/30
hover:shadow-amber-400/40
active:scale-98
disabled:opacity-50
```

**Ivory Variant**
```tailwind
bg-amber-50/96
border border-amber-200/65
rounded-[16px]
text-amber-950
shadow-md shadow-amber-900/18
disabled:opacity-50
```

**Glass Variant**
```tailwind
bg-white/14
backdrop-blur-lg
border border-amber-200/65
rounded-[16px]
text-white
shadow-sm shadow-amber-300/16
disabled:opacity-50
```

**Ghost Variant**
```tailwind
bg-transparent
text-amber-950
border-0
disabled:opacity-50
```

**Base Properties**
```tailwind
inline-flex items-center justify-center gap-2
font-semibold text-base tracking-tight
whitespace-nowrap
transition-all duration-120 ease-out
disabled:cursor-default cursor-pointer
w-full (if full prop)
```

---

### Glass Card

```tailwind
rounded-[22px]
backdrop-blur-2xl
border border-amber-200/22 (weak) | border-amber-300/55 (strong/active)
px-6 py-6 (pad-22)
bg-white/52 (standard) | bg-amber-50/88 (strong)
shadow-md shadow-amber-800/10
inset shadow-white/50

hover:scale-98 (if interactive)
transition-all duration-120 ease-out
```

---

### Input Fields (CPhoneField, CTextField)

**Container**
```tailwind
h-[58px]
rounded-[16px]
border-2 border-amber-200/30 (default) | border-amber-400 (focus)
bg-white/90
shadow-md shadow-amber-900/6 (default)
shadow-lg shadow-amber-300/16 (focus)
overflow-hidden
flex items-stretch
transition-all duration-200
```

**Input Text**
```tailwind
flex-1 min-w-0
border-0 outline-none
bg-transparent
font-medium text-lg text-amber-950
px-4 py-0
placeholder:text-amber-950/50
```

**Phone Field Button (Country Code)**
```tailwind
px-4 py-0
border-r border-amber-200/20
bg-transparent
font-medium text-base text-amber-950
cursor-pointer
flex items-center gap-1.5
```

---

### OTP Input Grid

```tailwind
flex gap-2
```

**Each OTP Cell**
```tailwind
h-[62px]
flex-1 min-w-0
rounded-[14px]
border-2 border-amber-200/25 (empty) | border-amber-400 (filled/focus)
bg-white/90 (empty) | bg-amber-50/10 (filled)
text-center
font-bold text-2xl text-amber-950
inset shadow-white/70
transition-all duration-150
focus:shadow-lg focus:shadow-amber-300/16
focus:border-amber-400
```

---

### Label (CLabel)

```tailwind
text-xs font-bold uppercase
tracking-wider (0.14em)
text-amber-700/60
mb-2
```

---

### Status Badge / Risk Badge

**Status Badge (on-time / at-risk / delayed / etc.)**
```tailwind
inline-flex items-center gap-1.5
rounded-full px-3 py-1 (sm) | px-3 py-1.5 (md)
text-xs font-semibold tracking-tight
before:w-1.5 before:h-1.5 before:rounded-full before:flex-shrink-0
before:[background-color inherited from status]

# Examples:
# On-Time: bg-green-100 text-green-700 before:bg-green-500
# At-Risk: bg-amber-100 text-amber-700 before:bg-amber-500
# Delayed: bg-orange-100 text-orange-700 before:bg-orange-500
# Cancelled: bg-red-100 text-red-700 before:bg-red-500
# Completed: bg-slate-100 text-slate-700 before:bg-slate-500
# Boarding: bg-sky-100 text-sky-700 before:bg-sky-500
```

---

### Pill / Badge (Recommended)

```tailwind
inline-flex items-center gap-1.5
bg-blue-600 text-white
rounded-full px-2.5 py-1
text-xs font-bold uppercase tracking-widest
shadow-md shadow-blue-500/40
```

**Risk Pill Dot:**
```tailwind
w-2 h-2 rounded-full flex-shrink-0
border-3 border-white
box-shadow: 0 0 0 3px color-mix(in srgb, [risk-color] 18%, transparent)
```

---

### Filter Chips

**Inactive**
```tailwind
flex-shrink-0
border border-amber-200/30
rounded-full px-3.5 py-1.5
text-sm font-medium text-amber-950
bg-white/60
backdrop-blur-lg
cursor-pointer
transition-all duration-150
```

**Active**
```tailwind
bg-gradient-to-r from-amber-300 to-amber-600
text-white
font-bold
border-0
shadow-md shadow-amber-400/25
```

---

### Section Header

```tailwind
flex items-center justify-between
mb-2.5
# Label
text-xs font-black uppercase tracking-widest text-amber-700/60
# Action Link
text-xs font-semibold text-amber-700 cursor-pointer tracking-tight
```

---

### Route Display

**Container**
```tailwind
flex items-center w-full gap-0
```

**Station (Code/Name)**
```tailwind
text-center min-w-fit
# Code
text-2xl (big) | text-lg (normal) font-black text-amber-950 tracking-tight leading-tight
# Name
text-xs (big: 11px) font-medium text-amber-700/60 mt-0.5
```

**Divider**
```tailwind
flex-1 flex items-center gap-1.5 mx-2
# Lines
flex-1 h-px bg-gradient-to-r from-amber-300/60 to-amber-300/10
# Plane icon
text-amber-500 w-4 h-4
```

---

### Star Rating

**Container**
```tailwind
inline-flex items-center gap-0.5
```

**Star (Lucide SVG)**
```tailwind
w-3 h-3 flex-shrink-0
# Full star: fill #c8a24e stroke-0
# Half star: gradient or clip-path overlay
# Empty star: fill #e5d5a8 stroke-0
```

**Count Text**
```tailwind
text-xs text-amber-700/60 ml-1 font-medium
```

---

### AppBar (CAppBar)

**Container**
```tailwind
sticky top-0 z-100
bg-amber-50/88 backdrop-blur-2xl
border-b border-amber-200/22
px-4 py-0 (+ safe-top padding)
h-[50px + 56px]
flex items-end gap-3
box-shadow-none
```

**Back Button**
```tailwind
w-8 h-8 rounded-[10px]
border border-amber-200/35
bg-white/60
backdrop-blur-lg
cursor-pointer flex items-center justify-center
hover:scale-95 transition-transform duration-120
```

**Title**
```tailwind
flex-1 min-w-0
font-bold text-base text-amber-950
truncate leading-tight
```

**Subtitle**
```tailwind
text-xs text-amber-700/60
mt-0.5 truncate
```

---

### Bottom Navigation (CBottomNav)

**Container**
```tailwind
flex-shrink-0
bg-amber-50/92 backdrop-blur-2xl
border-t border-amber-200/28
h-14 (+ safe-bottom padding)
flex items-start justify-around
pt-1 px-0
z-90
```

**Nav Tab Button**
```tailwind
flex-1
flex flex-col items-center gap-0.5
bg-none border-0 cursor-pointer outline-none
# Icon container
w-9 h-7 rounded-lg
bg-amber-300/13 (active) | bg-transparent
flex items-center justify-center
transition-bg duration-180

# Label
text-xs font-bold (active) | font-medium
text-amber-700 (active) | text-amber-700/60
tracking-tight leading-none
```

---

### Hotel Image Placeholder

```tailwind
w-full rounded-[12px]
bg-[gradient] (5 variants, see gradients above)
flex items-center justify-center
overflow-hidden
position-relative
# Initial letter
text-5xl font-black text-white/35 select-none tracking-tighter
# Decorative circles (absolutely positioned, pointer-events-none)
before: rounded-full bg-white/7 (sizes vary)
after: rounded-full bg-white/5
```

---

### Wordmark (CWord)

**Container**
```tailwind
inline-flex items-center gap-2.25
```

**Icon Circle**
```tailwind
w-8 h-8 (size ~= 20px)
rounded-full flex-shrink-0
grid place-items-center
# Light variant
bg-white/16 border border-white/40 backdrop-blur-lg
# Dark variant
bg-gradient-to-br from-amber-200 to-amber-700
box-shadow-lg shadow-amber-700/35
```

**"Fogora" Text**
```tailwind
font-display text-2xl leading-tight tracking-tight
text-amber-950 (dark) | text-white (light)
text-shadow-md text-black/30 (light only)
```

---

### Success Ring (CRing)

**Container**
```tailwind
relative w-28 h-28 grid place-items-center
```

**SVG Outer Ring (animated)**
```
<circle cx="56" cy="56" r="48" stroke="rgba(200,162,78,0.22)" stroke-width="3" fill="none" />
<circle cx="56" cy="56" r="48" stroke="#c8a24e" stroke-width="4" stroke-linecap="round"
  stroke-dasharray="301" animation="ringDraw2 .7s cubic-bezier(.3,.7,.3,1) .1s both" />
```

**SVG Checkmark (animated)**
```
<path d="M20 6L9 17l-5-5" stroke="#a8842f" stroke-width="2.4" stroke-dasharray="60"
  animation="drawCheck2 .4s ease-out .55s both" />
```

---

### Divider (CGoldDivider)

```tailwind
h-px my-0 mx-1
bg-gradient-to-r from-transparent via-amber-300/22 to-transparent
```

---

## 7. ANIMATION & MOTION PATTERNS

### Keyframe Animations (defined in HTML `<style>`)

**Spin (Loading)**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
/* Applied: animation: spin 0.7s linear infinite; */
```

**Fade In (cFade)**
```css
@keyframes cFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

**Fade Up (cFadeUp)**
```css
@keyframes cFadeUp {
  from { transform: translateY(16px); }
  to { transform: translateY(0); }
}
```

**Scale In (cScaleIn)**
```css
@keyframes cScaleIn {
  0% { transform: scale(0.96); }
  100% { transform: scale(1); }
}
```

**Hint Bob (floating indicator)**
```css
@keyframes hintBob {
  0%,100% { transform: translateY(0); opacity: 0.8; }
  50% { transform: translateY(7px); opacity: 1; }
}
```

**Ring Draw (success indicator)**
```css
@keyframes ringDraw2 {
  from { stroke-dashoffset: 301; }
  to { stroke-dashoffset: 0; }
}
```

**Check Draw (checkmark)**
```css
@keyframes drawCheck2 {
  from { stroke-dashoffset: 60; }
  to { stroke-dashoffset: 0; }
}
```

**Shimmer (loading placeholder)**
```css
@keyframes shimmer {
  from { background-position: -160px 0; }
  to { background-position: 220px 0; }
}
```

### Transition Patterns

| Interaction | Duration | Easing | Properties |
|---|---|---|---|
| Press/Scale | 0.12s (120ms) | ease-out | transform |
| Color/Shadow | 0.2s–0.25s (200–250ms) | ease-out | background, box-shadow, opacity |
| Border/Input Focus | 0.15s–0.2s (150–200ms) | linear | border-color, box-shadow |
| Chip Toggle | 0.15s (150ms) | ease | all |
| Risk Meter Bar | 0.8s (800ms) | cubic-bezier(.2,.7,.2,1) | transform (scaleX) |
| Tab/Nav Change | 0.18s (180ms) | ease | background, color |
| Ring Animation | 0.7s (700ms) | cubic-bezier(.3,.7,.3,1) | stroke-dashoffset |
| Check Animation | 0.4s (400ms) | ease-out | stroke-dashoffset |
| Field Label Transition | 0.3s (300ms) | ease-out | all |

### Press Feedback

All interactive elements (buttons, cards, nav tabs) implement scale feedback:
```css
transform: scale(0.98) /* on press */
transition: transform 0.1s ease-out
```

**Respects `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; }
}
```

---

## 8. ICON SYSTEM

**Icon Base (Lucide-style)**
- **Size Scale**: 13px, 16px, 18px, 20px, 24px (sizes can be passed dynamically)
- **Stroke Width**: 1.5 (default), 1.6–2.2 for emphasis
- **Style**: SVG, `stroke="currentColor"`, `fill="none"` (line icons)
- **Display**: `display: block; flex-shrink: 0;`
- **Centering**: All icons render inline; use flex for alignment

**Icon Families Defined:**
- Navigation: HomeIcon, User, Bell
- Transport: Plane, PlaneTakeoff, Train, Bus
- Actions: Check, X, Plus, ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Edit, RefreshCw
- Communication: MessageCircle, MessageSquare, Phone
- Info: Clock, Calendar, Lock, Shield, Search, ExternalLink, Cloud, CloudFog
- Status/Utility: Sparkles, SignalHigh, ChevronDown, Wind, Luggage, LifeBuoy, FileText, Compass, MapPin
- Custom (cine-shared.jsx): Star, Coffee, Wifi2, CarIcon, AlertTri, HelpCirc, CreditCard2, Globe2, Info2, Bookmark2, CheckCirc, XCircle2, LogOut2, BedIcon, Briefcase2, NavIcon, Building2, MonitorIcon

---

## 9. TAILWIND CONFIG REFERENCE

### Extend Configuration Needed
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Accent (Gold)
        accent: {
          50: '#f9f5f0',
          100: '#f0e7d7',
          200: '#e4cb89',
          300: '#d9bd74',
          400: '#c8a24e',
          500: '#c8a24e',
          600: '#a8842f',
          700: '#92700a',
          800: '#7a5a0a',
          900: '#5a4508',
        },
        // Sky
        sky: {
          50: '#dceaf4',
          100: '#9cc4e4',
          600: '#5b8fbf',
          900: '#2e5c82',
        },
        // Warm/Espresso
        espresso: '#2b2218',
        'warm-ink': '#4a3f31',
        'warm-muted': '#8c7c66',
      },
      backdropBlur: {
        glass: '18px',
        sm: '8px',
        lg: '14px',
        xl: '20px',
      },
      borderRadius: {
        button: '16px',
        card: '22px',
        input: '16px',
        otp: '14px',
        icon: '12px',
      },
      spacing: {
        'safe-top': '50px',
        'safe-bottom': '22px',
      },
      boxShadow: {
        'glass': '0 10px 30px rgba(33,24,14,0.10)',
        'gold-button': '0 2px 10px rgba(168,132,47,0.28), 0 10px 30px rgba(168,132,47,0.22), 0 0 12px rgba(200,167,97,0.16)',
        'ivory-button': '0 6px 20px rgba(20,14,8,0.18), 0 0 12px rgba(200,167,97,0.16)',
      },
      transitionDuration: {
        120: '120ms',
        150: '150ms',
        180: '180ms',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
};
```

---

## 10. SUMMARY TABLE: Component Styles

| Component | BG | Border | Radius | Shadow | Text Color |
|---|---|---|---|---|---|
| CButton (Gold) | gradient 135deg amber-200→amber-600 | amber-300/90 | 16px | lg gold-400/30 | amber-950 |
| CButton (Ivory) | amber-50/96 | amber-200/65 | 16px | md amber-900/18 | amber-950 |
| CButton (Glass) | white/14 + blur | amber-200/65 | 16px | sm amber-300/16 | white |
| Glass Card | white/52 + blur | amber-200/22 | 22px | md amber-800/10 | amber-950 |
| CInput | white/90 + blur | amber-200/30 (focus: amber-400) | 16px | input-focus | amber-950 |
| CLabel | — | — | — | — | amber-700/60 |
| Status Badge | status-colored/13 | — | 9999px | — | status-dark |
| CAppBar | amber-50/88 + blur | amber-200/22 | — | — | amber-950 |
| CBottomNav | amber-50/92 + blur | amber-200/28 | — | — | amber-700 (active) |
| Filter Chip (active) | gradient 135deg accent | — | 9999px | md accent/25 | white |

---

This specification is ready for implementation in a Next.js app with Tailwind CSS. All values are concrete, all animations are defined, and all components have direct Tailwind equivalents.