Based on my analysis of the source code and screenshots, I now have comprehensive information about the Aerly Cinematic app. Let me compile the Markdown spec.

## Aerly Cinematic - Main App Screens Specification

### Overview
The Aerly Cinematic app is a premium flight disruption assistant with a warm golden/sand aesthetic. It features three main app screens: the trips list, trip/flight detail, and transport alternatives presentation. The design uses glassmorphic cards, smooth animations, and accessibility-focused risk indicators.

---

## 1. MY TRIPS LIST SCREEN

**Route:** `CTrips` component
**AppBar:** Sticky header with "My Trips" title + notification bell (red dot indicator)

### Layout & Structure

```
[Sticky AppBar]
│ ← ChevronLeft (optional if back btn) | "My Trips" | 🔔 (with red dot)
│
[Body - Full Height Scrollable]
├─ [Sky-blue radial glow] (bg accent, position: absolute)
├─ Filter chips row (horizontal scroll)
│  └─ "Upcoming" | "Past" | "All" (active: gold gradient, inactive: semi-transparent)
├─ Section Header
│  └─ "UPCOMING TRIPS" (uppercase, 11px, bold) + [Badge: count]
└─ Trip Cards Stack
   └─ [TripCard] × N
```

### Trip Card Anatomy

**Container:**
- Component: `GoldCard` with `active: trip.status === "at-risk"`
- Padding: 18px
- Background: `rgba(255,255,255,0.54)` + `blur(16px)`
- Border: `1px solid rgba(200,162,78,0.22)` (inactive) or `1.5px solid rgba(200,162,78,0.55)` (active/at-risk)
- Border radius: 20px
- Shadow: `0 2px 12px rgba(180,140,60,0.08)`
- Cursor: pointer

**Card Content Layout:**

```
┌─────────────────────────────────────┐
│ [Status Badge] ← Right Aligned      │  (e.g., "At Risk", "On Time")
│ "Sat, Jun 7" →                      │  (Date on right, 12px, muted)
│                                     │
│ [Alert Banner] (if status="at-risk")│  
│ ⚠ "Fog risk 78% between 04:00–09:00"│
│                                     │
│ [Route Display]                     │
│  IAS                    OTP         │
│  Iași  ———→ Plane ←———  Bucharest  │
│                                     │
│ 08:30 → 09:45  ⏱ 1h 15m   [Logo] W6│
│                                     │
│ [View alternatives →] (if at-risk)  │
└─────────────────────────────────────┘
```

### Trip Card - Detailed Styling

**Top Row (Status + Date):**
- `display: flex; justify-content: space-between; margin-bottom: 10-12px`
- Status badge: Left aligned
- Date: Right aligned, `font: 500 12px 'Hanken Grotesk'`, color: `var(--warm-muted)`

**Alert Banner** (visible if `trip.alerts.length > 0`):
- Background: `rgba(255,193,7,0.15)`
- Border: `1px solid rgba(255,193,7,0.35)`
- Border radius: 8px
- Padding: 6px 10px
- Margin bottom: 12px
- Icon: AlertTriangle, color: `#b45309`
- Text: `font: 500 12px`, color: `#b45309`, line-height: 1.3

**Route Display Component:**
- Layout: `display: flex; align-items: center; width: 100%`
- From/To stations: text-align left/right, min-width: 40px
- Code: `font: 800 18px`, color: `var(--espresso)`
- City name: `font: 500 9px`, color: `var(--warm-muted)`, margin-top: 2px
- Divider: flex-grow with gradient line + Plane icon

**Times + Airline Row:**
- Layout: `flex; wrap: wrap; gap: 6px (row), margin-top: 12px`
- Departure: `font: 700 13px`, color: `var(--espresso)`
- Arrow: `font: 12px`, margin: 0 6px
- Arrival: `font: 700 13px`, color: `var(--espresso)`
- Duration badge: `font: 11px`, color: `var(--warm-muted)`, margin: 0 8px, display: flex with Clock icon
- Spacer: `flex: 1`
- Airline circle:
  - Size: 26×26px, border-radius: 50%
  - Background: `trip.airlineBg` (e.g., `rgba(0,74,153,0.12)`)
  - Border: `1.5px solid {airlineColor}33`
  - Logo: `font: 800 9px`, color: `trip.airlineColor`, letter-spacing: -0.3px
- Airline name: `font: 500 12px`, color: `var(--warm-muted)`

**"View alternatives" Button** (visible if `status === "at-risk"`):
- Margin top: 14px
- Full width: 100%
- Height: 40px
- Background: `linear-gradient(135deg, rgba(217,189,116,0.22), rgba(200,167,97,0.10))`
- Border: `1px solid rgba(217,189,116,0.90)`
- Box shadow: `0 0 12px rgba(200,167,97,0.16)`
- Border radius: 12px
- Font: `700 13px 'Hanken Grotesk'`
- Color: `var(--espresso)`
- Letter spacing: 0.01em
- Copy: "View alternatives →"

### Status Badge Component

**Styling:**
- Display: inline-flex, gap: 5px
- Border radius: 99px (pill shape)
- Padding: 3px 8px (small)
- Font: 600 11px
- Letter spacing: 0.02em
- Dot: 6px width/height, border-radius: 50%

**Status Color Mappings:**
- `on-time`: bg `rgba(34,197,94,0.13)`, dot `#22c55e`, text `#15803d`
- `at-risk`: bg `rgba(200,162,78,0.15)`, dot `#c8a24e`, text `#92700a`
- `delayed`: bg `rgba(249,115,22,0.13)`, dot `#f97316`, text `#c2410c`
- `cancelled`: bg `rgba(239,68,68,0.13)`, dot `#ef4444`, text `#b91c1c`
- `completed`: bg `rgba(148,163,184,0.15)`, dot `#94a3b8`, text `#64748b`

### Filter Chips (Horizontal Scrollable)

- Layout: `display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px`
- Inactive chip:
  - Border: `1px solid rgba(200,162,78,0.30)`
  - Background: `rgba(255,255,255,0.6)`
  - Backdrop filter: `blur(8px)`
  - Font: 500 12px
  - Color: `var(--warm-ink)`
- Active chip:
  - Border: none
  - Background: `linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)`
  - Font: 700 12px
  - Color: `#fff`
  - Box shadow: `0 2px 8px rgba(200,162,78,0.25)`
- Transition: `all 0.15s ease`

### Background Gradient (CTrips)
```css
background: linear-gradient(180deg, 
  var(--ivory, #faf8f4) 0%, 
  var(--cream, #f5f0e8) 60%, 
  var(--sand-soft, #ede8dc) 100%)
```

---

## 2. TRIP DETAIL SCREEN

**Route:** `CTripDetail` component
**Navigation:** Back button in AppBar triggers `app.back()`

### Top-Level Layout

```
[Sticky AppBar]
├─ Back button (34×34px, border: 1px solid rgba(200,162,78,0.35))
├─ "Flight Details" title
└─ No right action

[Scrollable Body]
├─ Hero card (flight overview)
├─ Cancellation risk bar
├─ Weather risk gauges
├─ Flight info grid
├─ Timeline
├─ Transport alternatives
└─ Action buttons
```

### Hero Card (Flight Overview)

**Container:**
- `GoldCard` with `active: true, elevated: true`
- Padding: 20px
- Margin: 16px

**Content Structure:**

```
[Status Badge]  (e.g., "At Risk")

[Route Display - BIG]
  08:30 → 09:45
  
[Date + Airline + Flight Number Row]
📅 Sat, Jun 7 · [Logo] TAROM · RO 1234

[Duration Badge]
⏱ 1h 15m
```

**Route Display (Big):**
- Layout: `display: flex; align-items: center; width: 100%`
- Code size: 28px (vs 18px in list)
- City name size: 11px (vs 9px)
- Font weight: 800
- Color: `var(--espresso)`

**Times (Large):**
- Dep/Arr: `font: 800 32px`, color: `var(--espresso)`, letter-spacing: -1px
- Arrow: `font: 400 18px`, color: `var(--warm-muted)`, margin: 0 10px
- Margin top: 14px

**Meta Row (Date + Airline + Flight):**
- Layout: `flex; flex-wrap: wrap; row-gap: 6px; margin-top: 10px`
- Date: flex with Calendar icon, `font: 500 12px`, color: `var(--warm-muted)`
- Separator dots: `font: 11px`, color: `var(--warm-muted)`
- Airline: flex with colored circle (20×20px) + name
- Flight number: `font: 700 12px`, color: `var(--espresso)`, letter-spacing: 0.02em

**Duration Badge:**
- Inline-flex, gap: 5px
- Background: `rgba(200,147,42,0.12)`
- Border: `1px solid rgba(200,147,42,0.25)`
- Border radius: 20px
- Padding: 4px 10px
- Icon: Clock, color: `#c8932a`
- Font: 600 12px, color: `#c8932a`
- Margin top: 12px

### Cancellation Risk Bar

**Container:**
- Margin: 16px
- Background: `rgba(255,255,255,0.62)` + `blur(18px)`
- Border: `1px solid rgba(189,75,9,0.38)`
- Box shadow: `0 2px 16px rgba(189,75,9,0.12), inset 0 1px 0 rgba(255,255,255,0.6)`
- Border radius: 18px
- Padding: 18px 20px

**Header Row:**
- `display: flex; justify-content: space-between; margin-bottom: 14px`
- Title: `font: 700 13px`, color: `#BD4B09`, text-transform: uppercase, letter-spacing: 0.08em
  - Copy: "FLIGHT RISK OF BEING CANCELLED"
- Risk level badge: `font: 700 11px`, padding: 3px 10px, border radius: 20px
  - Background: `rgba(189,75,9,0.10)`
  - Border: `1px solid {levelColor}88`
  - Color: dynamic (see level colors below)

**Large Percentage Display:**
- Font: 800 44px, color: `#BD4B09`
- Line height: 1
- Letter spacing: -1.5px
- Margin bottom: 12px
- Copy: "{cancelPct}%"

**Progress Bar:**
- Container: height 10px, border-radius: 99px, background: `rgba(189,75,9,0.12)`, border: `1px solid rgba(189,75,9,0.22)`
- Fill: width based on `cancelPct`, background: `linear-gradient(90deg, #9B3707 0%, #BD4B09 55%, #D4601A 100%)`
- Box shadow: `0 0 8px rgba(189,75,9,0.42)`
- Margin bottom: 12px

**Explanation Text:**
- Font: 400 12px, color: `rgba(189,75,9,0.70)`, line-height: 1.45
- Copy: "Based on fog conditions and historical METAR data for {from}. Risk increases significantly between 04:00–09:00."

**Risk Level Colors:**
- High (≥60%): `#9B3707` (dark rust)
- Moderate (35-59%): `#BD4B09` (burnt orange)
- Low (<35%): `#D4601A` (rust-orange)

### Weather Risk Panel

**Container:**
- Margin: 16px
- Background: `linear-gradient(135deg, #0B1B2A 0%, #123A56 45%, #1F6F94 100%)` (dark blue)
- Border radius: 20px
- Padding: 24px 20px 28px
- Position: relative, overflow: hidden
- Decorative circle (absolute): top -40px, right -40px, 120×120px, border-radius: 50%, background: `rgba(255,255,255,0.08)`

**Header:**
- Layout: `flex; gap: 12px; margin-bottom: 24px`
- Icon: Cloud (22px, color: `#CFE1ED`, stroke-width: 1.8)
- Title: "Flight Weather Risk"
  - Font: 600 21px (display font), color: `#F6F4EF`, letter-spacing: 0.01em

**Risk Gauges Grid:**
- Layout: `display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px`
- Items: Fog Risk, Bad Weather, Overall

### Risk Gauge Component

**Circular Progress SVG:**
- Container: 94×94px, position: relative
- Background circle: cx/cy 47, r 36, stroke `rgba(255,255,255,0.18)`, stroke-width: 7
- Progress circle: same positioning, stroke matches risk color, stroke-dasharray/offset for animation
- Center text: `{pct}%`, font: 800 20px, color: `#F6F4EF`, line-height: 1

**Below Gauge:**
- Icon: size 18, color: `rgba(246,244,239,0.85)`, stroke-width: 1.8
- Label: font: 400 11px, color: `rgba(246,244,239,0.78)`, text-align: center, line-height: 1.2, margin-top: 2px
- Risk level: font: 700 11px, letter-spacing: 0.04em, color: level color
  - Colors: High `#F97316`, Moderate `#EAB308`, Low `#4ADE80`

**Risk Gauge Data:**
```javascript
[
  { id: "fog", label: "Fog Risk", pct: 78, Icon: CloudFog, level: "High", lc: "#F97316" },
  { id: "weather", label: "Bad Weather", pct: 40, Icon: Cloud, level: "Moderate", lc: "#EAB308" },
  { id: "overall", label: "Overall", pct: 55, Icon: AlertTri, level: "Moderate", lc: "#EAB308" }
]
```

**Footer Text:**
- Font: 400 11px, color: `rgba(207,225,237,0.50)`, text-align: center, margin-top: 20px
- Copy: "Based on METAR data for {from} · Updated 15 min ago"

### Flight Info Grid Section

**Header:**
- `SectionHeader` component: "FLIGHT INFO" (uppercase, 11px, bold, letter-spacing: 0.09em)

**Card Container:**
- `GoldCard`, padding: 16px

**Grid Layout:**
- `display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px`

**Grid Items (2×2):**
```
Terminal  | Gate
---------|----------
T1        | G12

Baggage   | Duration
---------|----------
Belt 3    | 1h 15m
```

**Item Structure:**
- Label: `font: 600 10px`, color: `var(--warm-muted)`, text-transform: uppercase, letter-spacing: 0.06em, margin-bottom: 3px
- Value: `font: 600 14px`, color: `var(--espresso)`

### Flight Timeline Section

**Header:** "FLIGHT TIMELINE" (uppercase, 11px, bold)

**Card Container:** `GoldCard`, padding: 16px

**Timeline Layout:**
- Container: `position: relative`
- Each step: `display: flex; align-items: flex-start; gap: 12px; position: relative; padding-bottom: 20px` (last item: 0)

**Left Column (Dot + Connector):**
- Container: `display: flex; flex-direction: column; align-items: center; width: 16px; flex-shrink: 0`
- Dot: 14×14px, border-radius: 50%
  - Done: `linear-gradient(135deg, #d4a843, #c8932a)`, box-shadow: `0 1px 4px rgba(200,147,42,0.3)`
  - Pending: transparent, border: `2px solid #c8932a`
  - Margin top: 2px
- Vertical connector (not on last): 2px width, flex: 1, min-height: 16px, border-radius: 1px, margin-top: 3px
  - Done: `linear-gradient(180deg, #c8932a, rgba(200,147,42,0.3))`
  - Pending: `rgba(200,147,42,0.2)`

**Right Column (Content):**
- Layout: `flex; gap: 10px; flex: 1`
- Icon box: 28×28px, border-radius: 8px
  - Done: background `rgba(200,147,42,0.14)`
  - Pending: background `rgba(200,147,42,0.07)`
  - Icon: size 14, color: done `#c8932a` / pending `var(--warm-muted)`
- Text group:
  - Time: `font: 700 13px`, color: done `var(--espresso)` / pending `var(--warm-muted)`
  - Label: `font: 400 11px`, color: `var(--warm-muted)`, margin-top: 1px

### Transport Alternatives Section

**Header:** "TRANSPORT ALTERNATIVES" (uppercase, 11px, bold), margin: 20px 16px 0

**Cards Stack:** Vertical flex, gap: 10px, margin-top: 10px

### Transport Alt Card Component

**Container:**
- Background: `rgba(255,255,255,0.54)` + `blur(16px)`
- Border: `1px solid rgba(200,167,97,0.38)`
- Border radius: 18px
- Padding: 14px 14px 12px
- Box shadow: `0 2px 12px rgba(180,140,60,0.08)`
- Margin bottom: 10px

**Header Row:**
- Layout: `flex; align-items: center; gap: 8px; margin-bottom: 10px`
- Icon box: 32×32px, border-radius: 9px
  - Background: `rgba(200,162,78,0.10)`
  - Border: `1px solid rgba(200,167,97,0.28)`
  - Icon: size 16, color: `var(--accent-deep)`, stroke-width: 1.8
- Content: flex: 1, min-width: 0
  - Title: `font: 700 13px`, color: `var(--espresso)`, line-height: 1.15
  - Carrier: `font: 400 11px`, color: `var(--warm-muted)`
- Availability badge: font: 600 10px, padding: 3px 8px, border-radius: 20px, flex-shrink: 0
  - Green available: color `#22C55E`, bg `rgba(34,197,94,0.10)`, border `1px solid #22C55E44`
  - Yellow limited: color `#EAB308`, bg `rgba(234,179,8,0.10)`, border `1px solid #EAB30844`

**Times Row:**
- Layout: `flex; justify-content: space-between; margin-bottom: 10px`
- Departure time box: text-align: center, min-width: 44px
  - Time: `font: 800 17px`, color: `var(--espresso)`, line-height: 1
  - Code: `font: 400 9px`, color: `var(--warm-muted)`, margin-top: 2px
- Center connector: flex: 1, padding: 0 6px
  - Duration: `font: 400 10px`, color: `var(--warm-muted)`, margin-bottom: 3px
  - Divider: flex with gradient lines and Plane icon (10px, color: `var(--accent-deep)`, stroke-width: 2)
- Arrival time box: same as departure
- Gradient lines: `linear-gradient(90deg, transparent/rgba(...) → rgba(...)/transparent)`

**Price + CTA Row:**
- Layout: `flex; justify-content: space-between`
- Price: font: 700 19px (display), color: `var(--espresso)`
  - Suffix: `font: 400 10px`, color: `var(--warm-muted)`, margin-left: 4px
  - Copy: "€89 / person"
- Button: height 36px, border-radius: 11px, padding: 0 14px
  - Background: `linear-gradient(135deg, rgba(217,189,116,0.22), rgba(200,167,97,0.10))`
  - Border: `1px solid rgba(217,189,116,0.90)`
  - Box shadow: `0 0 12px rgba(200,167,97,0.16)`
  - Font: 600 12px, color: `var(--espresso)`
  - Letter spacing: 0.01em
  - Copy: "Book flight →" (or variant: "View trains", "Book bus", "Get ride")

### Alt Transport Examples Data

```javascript
[
  {
    type: "flight",
    Icon: Plane,
    label: "Alternative Flight",
    carrier: "Wizz Air W6 4502",
    dep: "11:45",
    arr: "13:00",
    duration: "1h 15m",
    fromCode: "IAS",
    toCode: "OTP",
    price: "€89",
    avail: "5 seats",
    availColor: "#EAB308",
    cta: "Book flight"
  },
  {
    type: "train",
    Icon: Train,
    label: "CFR Train IR 1746",
    carrier: "CFR Călători",
    dep: "10:15",
    arr: "14:30",
    duration: "4h 15m",
    fromCode: "IAS",
    toCode: "OTP",
    price: "€22",
    avail: "Available",
    availColor: "#22C55E",
    cta: "View trains"
  },
  {
    type: "bus",
    Icon: Bus,
    label: "Bus / Coach",
    carrier: "Flixbus",
    dep: "09:00",
    arr: "13:45",
    duration: "4h 45m",
    fromCode: "IAS",
    toCode: "OTP",
    price: "€14",
    avail: "Available",
    availColor: "#22C55E",
    cta: "Book bus"
  },
  {
    type: "car",
    Icon: CarIcon,
    label: "Car / Ride",
    carrier: "Bolt · Drive",
    dep: "On demand",
    arr: "~4h",
    duration: "~3h 50m",
    fromCode: "IAS",
    toCode: "OTP",
    price: "€45–65",
    avail: "On demand",
    availColor: "#22C55E",
    cta: "Get ride"
  }
]
```

### Action Buttons (Bottom)

**Layout:**
- Container: margin: 24px 16px 0, display: flex, flex-direction: column, gap: 12px
- Full width buttons

**Button 1 - "Get help with this trip":**
- Variant: gold
- Icon: LifeBuoy (16px)
- Action: `app.go("helpWizard")` with `helpCategory: "delayed"`

**Button 2 - "Find hotels nearby":**
- Variant: ivory
- Icon: BedIcon (16px)
- Action: `app.go("hotels")` with `hotelCity: trip.fromCity`

---

## 3. APP BAR (CAppBar)

**Structure:**
```
[Sticky Container]
├─ Safe top padding
├─ [Back Button] (optional)
├─ [Title + Subtitle]
└─ [Right Slot] (optional)
[Bottom border + safe area]
```

**Container Styling:**
- Position: sticky, top: 0, z-index: 100
- Background: `rgba(255,253,247,0.88)` + `blur(18px)`
- Backdropfilter: `blur(18px)`
- Border bottom: `1px solid rgba(200,162,78,0.22)` (unless `noBorder: true`)
- Padding: `{safeTop}px 16px 0`
- Height: `safeTop + 56px`
- Display: flex, align-items: flex-end
- Padding bottom: 10px, gap: 12px
- Flex shrink: 0

**Back Button** (if `onBack` provided):
- Size: 34×34px
- Border radius: 10px
- Border: `1px solid rgba(200,162,78,0.35)`
- Background: `rgba(255,255,255,0.6)`
- Icon: ChevronLeft (18px, color: `var(--accent-deep)`, stroke-width: 2.5)
  - Fallback: text "‹" (700 18px, color: `var(--accent-deep)`)

**Title Section** (flex: 1):
- Title: `font: 700 16px`, color: `var(--espresso)`, line-height: 1.2
- Subtitle (if provided): `font: 400 11px`, color: `var(--warm-muted)`, margin-top: 1px
- Overflow: hidden text-overflow ellipsis, white-space: nowrap

**Right Slot** (optional):
- Flex shrink: 0
- Custom content passed as prop

**Safe Area Constants:**
- `CSAFE_TOP: 50px`
- `CSAFE_BOTTOM: 22px`

---

## 4. BOTTOM NAVIGATION

**Component:** `CBottomNav`

**Container:**
- Flex shrink: 0
- Background: `rgba(255,253,247,0.92)` + `blur(20px)`
- Border top: `1px solid rgba(200,162,78,0.28)`
- Display: flex, space-around
- Height: 56 + `{safeBottom}px`
- Padding top: 4px, padding bottom: `{safeBottom}px`
- Z-index: 90

**Tab Button (Per Item):**
- Flex: 1
- Layout: flex, flex-direction: column, align-items: center, gap: 3px
- Background: none, border: none
- Padding: 4px 0
- Cursor: pointer

**Tab Content:**
- Icon box: 36×28px, border-radius: 9px
  - Active: background `rgba(200,162,78,0.13)`, transition: `background 0.18s ease`
  - Inactive: background transparent
- Icon: size 20, color: active `var(--accent-deep)` / inactive `var(--warm-muted)`, stroke-width: active 2.2 / inactive 1.7
- Label: `font: {active ? 700 : 500} 10px`, color: inherited from icon, line-height: 1, letter-spacing: 0.01em

**Tabs Definition:**
```javascript
[
  { id: "home", screen: "main", label: "Home", Icon: HomeIcon },
  { id: "trips", screen: "trips", label: "Trips", Icon: Luggage },
  { id: "help", screen: "help", label: "Help", Icon: LifeBuoy },
  { id: "hotels", screen: "hotels", label: "Hotels", Icon: Building2 },
  { id: "profile", screen: "profile", label: "Profile", Icon: User }
]
```

**Screen-to-Tab Mapping:**
- main → home
- trips, tripDetail → trips
- help, helpWizard, compensation → help
- hotels, hotelDetail → hotels
- profile → profile

---

## 5. DESIGN TOKENS & COLOR PALETTE

### CSS Variables (Set via `--accent`)

```css
--accent: #C8A24E (gold/warm default, customizable)
--accent-deep: color-mix(in srgb, {accent} 76%, #000)
--accent-soft: color-mix(in srgb, {accent} 55%, #fff)
--display-font: "Instrument Serif" (customizable)
--card-r: 22px (Soft) | 16px (Rounded) | 28px (Pillowy)

--espresso: #2c1a0e (dark brown text)
--ivory: #faf8f4 (off-white)
--cream: #f5f0e8 (warm cream)
--sand: sand-toned backgrounds
--warm-ink: golden-brown text
--warm-muted: #9c8c7a (muted warm gray)
--warm-faint: very light warm gray
--sky-ink: sky-blue text
--gold: #c8932a (warm gold)
--gold-soft: lighter gold variant
```

### Border & Shadow Tokens

```javascript
GOLD_BORDER_SM  = "1px solid rgba(200,162,78,0.22)"    // secondary cards
GOLD_BORDER_MD  = "1px solid rgba(200,162,78,0.35)"    // active/elevated
GOLD_SHADOW_SM  = "0 1px 0 rgba(255,255,255,0.5) inset, inset 0 0 0 0.5px rgba(200,162,78,0.10), 0 8px 22px rgba(33,24,14,0.08)"
GOLD_SHADOW_LG  = "0 2px 0 rgba(255,255,255,0.32) inset, inset 0 0 0 0.5px rgba(200,162,78,0.18), 0 14px 34px rgba(168,132,47,0.30)"
```

### Gradients

**Background (CTrips, CTripDetail):**
```
linear-gradient(180deg, var(--ivory, #faf8f4) 0%, var(--cream, #f5f0e8) 60%, var(--sand-soft, #ede8dc) 100%)
```

**Accent Gold (Primary CTA):**
```
linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 52%, var(--accent-deep) 100%)
```

**Weather Panel:**
```
linear-gradient(135deg, #0B1B2A 0%, #123A56 45%, #1F6F94 100%)
```

**Route Divider Lines:**
```
linear-gradient(90deg, rgba(200,162,78,0.6), rgba(200,162,78,0.1))
linear-gradient(90deg, rgba(200,162,78,0.1), rgba(200,162,78,0.6))
```

---

## 6. TYPOGRAPHY

**Font Stack:**
- Display: "Instrument Serif" (headers, hero copy) — customizable via tweaks
- Body: "Hanken Grotesk" (UI text)

**Key Sizes:**
- Hero heading: 28-32px, 600-800 weight, line-height: 1.05-1.08
- Section header: 11px, 700 weight, uppercase, letter-spacing: 0.09em
- Card title: 13-16px, 700 weight
- Body text: 12-14px, 500 weight
- Small label: 10-11px, 600 weight, uppercase, letter-spacing: 0.06-0.1em

---

## 7. ANIMATIONS & INTERACTIONS

**Transitions:**
- Card scale on press: `transform 0.12s ease` (0.98 scale)
- Box shadow fade: `0.2s ease`
- Filter chip active/inactive: `all 0.15s ease`
- Icon/text color: `0.18s ease`
- Fade-in on mount: `cFadeUp 0.3s ease-out`

**Gestures:**
- Cards interactive (clickable): pointer cursor, scale feedback
- Buttons: press state (0.97-0.98 scale)

---

## 8. TAILWIND CLASS EQUIVALENTS (Reference)

For Tailwind rebuild, map these utilities:

```
Spacing & Padding:
  18px padding → p-5 (varies by context)
  16px margin/padding → p-4, m-4
  
Typography:
  font: 700 14px 'Hanken Grotesk' → font-bold text-sm font-hanken
  font: 800 32px → font-black text-4xl
  letter-spacing: 0.01em → tracking-tight
  uppercase + 0.09em → uppercase tracking-widest
  
Colors:
  rgba(255,255,255,0.54) + blur → backdrop-blur-md bg-white/54
  var(--espresso) → text-amber-950
  #c8932a → text-amber-700
  
Shadows & Borders:
  1px solid rgba(...) → border border-amber-900/22
  0 2px 12px rgba(...) → shadow-sm
  0 8px 22px ... → shadow-lg
  
Layout:
  display: flex; gap: 8px → flex gap-2
  grid-template-columns: 1fr 1fr → grid grid-cols-2
  flex: 1 → flex-1
  
Border Radius:
  border-radius: 20px → rounded-3xl
  border-radius: 99px → rounded-full
  
Backdrop:
  backdrop-filter: blur(16px) → backdrop-blur-2xl
```

---

## Implementation Notes

1. **Responsiveness:** Current prototype targets mobile (402×874px), but the design uses relative units suitable for scaling. Use Tailwind's responsive prefixes (sm:, md:) for larger screens.

2. **Dark Mode:** The design includes a dark variant (intro screens). Use Tailwind's `dark:` prefix for night mode support if needed.

3. **Accessibility:** 
   - Status badges use both color + icon/dot (not color alone)
   - Sufficient contrast in risk indicators
   - Icons have stroke-width adjustments for active/inactive states

4. **Performance:**
   - Glassmorphic cards use `backdrop-filter: blur()` — may require GPU acceleration on lower-end devices
   - Use `will-change: transform` sparingly on interactive cards
   - Lazy-load alt transport cards below the fold

5. **Glass morphism:** All cards use semi-transparent white background + blur filter. This requires browser support for `backdrop-filter` (all modern browsers, with -webkit- prefix for Safari).

6. **Safe Area Insets:** Use Tailwind's `safe-top`, `safe-bottom` utilities (or CSS variables) to handle notch/rounded corners on iOS/Android.

---

This spec captures the full visual hierarchy, spacing, typography, colors, and interactive states needed to rebuild Aerly Cinematic's main app screens in Tailwind CSS. Each component is self-contained and reusable.