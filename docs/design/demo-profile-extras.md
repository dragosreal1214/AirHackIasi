Now I'll create comprehensive Markdown specifications for each of the four secondary screens.

---

# Aerly Cinematic Prototype — Secondary Screen Specs

## 1. PROFILE SCREEN

**File:** `cine-profile.jsx`

### Purpose
User account hub showing personal details, travel history, saved content, preferences, and account settings. Acts as the control center for all user data and app settings.

### Layout Structure
- **Fixed Background:** Deep blue cinematic video (or gradient fallback) with navy overlay
- **Sticky Header:** Dark gradient bar with back button, "Profile" title, and edit button
- **Scrollable Content:** Cards stacked vertically over fixed background
- **Safe Area:** Respects top/bottom safe zones (CSAFE_TOP, CSAFE_BOTTOM)

### Key Components

#### Header
- Chevron left button (back)
- Title: "Profile" (display font, 17px, bold)
- Edit button (icon only)
- Dark gradient background fading to transparent

#### Avatar Section
- Large circular gradient avatar (88×88px) with gold border
- Initials centered inside (28px, bold)
- Name below (26px, display font)
- Phone number (14px, secondary text)
- Status chip: "Clear skies today" with sparkle icon (blue accent)
- Animation: fade-up on load

#### Card Sections (Blue Glass Cards)
Each section is a frosted glass card with:
- 1px gold-tinted border
- 18px blur backdrop filter
- 24px border radius
- Padding: 18px
- Subtle press animation (scale 0.98)

**Sections:**
1. **Personal Information**
   - Username (with edit)
   - Phone (with edit)
   - Email (with edit prompt)

2. **My Travel**
   - Saved Trips (2 upcoming)
   - Saved Hotels (1 saved)
   - Travel Documents (0 documents)

3. **Preferences**
   - Language (English)
   - Notifications (toggle switch with animated pill)
   - Country (Romania)

4. **Account**
   - Payment Methods
   - Help & Support
   - Privacy & Security

5. **Log Out**
   - Red accent variant
   - Dangerous action styling

#### Profile Row Component (PRow)
- Icon in 36×36 blue tinted badge (11px radius)
- Label (15px, bold, sky light)
- Optional value (12px, secondary)
- Optional right element (chevron)
- Minimum height: 52px
- Press scale: 0.985

### Copy & Messaging
- Header: "Profile"
- Section headers: Uppercase, 10px, 0.11em letter spacing
- Status: "Clear skies today"
- Dividers: Gradient line with subtle gold tint
- Footer: "Fogora v1.0 · Built at Air Hack Iași 2026"

### Color Palette
```
Navy:          #0B1B2A
Sky Light:     #CFE1ED
Sky Soft:      #EAEFF1
Sky Medium:    #79BADA
Sky Accent:    #3195BF
Glass Card:    rgba(234,239,241,0.16)
Gold Border:   rgba(200,167,97,0.38)
Light Text:    #F6F4EF
Secondary:     rgba(246,244,239,0.72)
```

### Styling Notes
- **Fonts:** Display font for headings, system font for body
- **Border radius:** 24px cards, 11px icon badges, 10px buttons
- **Blur effects:** 18px backdrop on cards, 12px on header buttons
- **Shadows:** Layered glow effects (0 0 0 5px halo, 0 10px 30px drop)
- **Transitions:** 0.12s ease for scale effects
- **Scrollbar:** Hidden (class `no-sb`)

### Tailwind Rebuild Notes
- Build glass effect with `backdrop-blur-lg` + transparent background
- Use custom blue palette (add to config)
- Circular avatar: `w-[88px] h-[88px] rounded-full`
- Icon badges: `w-9 h-9 rounded-[11px]`
- Gold gradient divider: Custom `linear-gradient` background
- Safe area padding: Conditional classes for `CSAFE_TOP` and `CSAFE_BOTTOM`

---

## 2. HOTELS SCREEN

**File:** `cine-hotels.jsx`

**STATUS: NEW FEATURE** — Not typical in standard flight-alert apps. Adds accommodation discovery & booking.

### Purpose
Help users affected by flight disruptions find and book nearby hotels. Two-screen flow: hotels list + detail view.

### Layout Structure (List View)
- **Background:** Warm cream-to-sand gradient with subtle gold glow
- **App Bar:** "Hotels Nearby" header
- **Content:** Search bar, filter chips, sort selector, hotel cards
- **Stack:** Full-width scrollable list

### Key Components

#### Search Bar
- Placeholder: "City or airport…"
- MapPin icon on left (gold, 16px)
- Border: 1.5px gold
- Height: 48px
- Border radius: 14px
- Background: Transparent white (0.7 opacity)

#### Location Chip
- "Iași Airport (IAS)" — detected location
- Gold icon + text
- Subtle background badge

#### Filter Chips (FilterChips Component)
- Options: "All", "Shuttle", "Breakfast", "Free cancellation", "Available now"
- Single select
- Style: Light gold background badges

#### Sort Selector
- Dropdown menu
- Options: "Distance", "Price: Low–High", "Rating"
- Gold border, light background

#### Hotel Cards (HotelCard Component)
- **Image placeholder:** 110px height
- **Content section:** 14px padding
- **Layout:**
  - Name + availability badge (top row)
  - Star rating + review count + distance (second row)
  - Tag pills (up to 2 visible)
  - Price large + "View hotel" button (bottom)
- **Styling:**
  - 18px border radius
  - Gold border, glass effect
  - "Sold out" badge in red
  - Tags: Gold background, gold border

#### Detail View
- **Hero image:** 200px full-width with gradient overlay
- **Back + Save buttons:** Positioned absolutely top corners (circular, 38×38px)
- **Content:**
  - Name + availability status
  - Rating + review count
  - Price display (large, Georgia serif)
  - Distance chip
  - Gold divider
  - Address & phone with icons
  - Amenities grid (2 columns)
  - Tags section (wrapped)
- **Sticky bottom bar:**
  - "Book now" primary button
  - Secondary actions: "Call hotel", "Save to trip"

### Copy & Messaging
- Header: "Hotels Nearby"
- Search placeholder: "City or airport…"
- Location chip: "Iași Airport (IAS)"
- Button: "View hotel →"
- "Book now" CTA
- Actions: "Call hotel", "Save to trip"
- No results: "No hotels match this filter."

### Color Palette (Warm/Gold theme)
```
Espresso:      #2C1A0E
Gold:          #C49B50
Gold Dark:     #A07A28
Muted:         #9B8EA0
Cream Grad:    #FDF8F0 → #F9F2E3 → #F3E9D2
White/Ivory:   rgba(255,255,255,0.7–0.88)
```

### Styling Notes
- **Border radius:** 18px cards, 14px inputs, 20px pills
- **Borders:** 1.5px gold throughout
- **Images:** Placeholder with hotel name rendered
- **Stars:** Custom rating component
- **Amenities icons:** Lucide icons + emoji fallbacks
- **Buttons:** Gold variant, outlined gold variant, gold solid
- **Backdrop blur:** 12px on sticky bottom

### Tailwind Rebuild Notes
- Background gradient: `linear-gradient(160deg, #fdf8f0 0%, #f9f2e3 50%, #f3e9d2 100%)`
- Hotel cards: `rounded-[18px] overflow-hidden`
- Image: `h-[110px] w-full object-cover`
- Grid layout: `grid-cols-2 gap-2` for amenities
- Sticky bottom: `sticky bottom-0 bg-opacity-92 backdrop-blur`
- Input styling: Custom gold border, light bg, no default styling

---

## 3. COMPENSATION SCREEN

**File:** `cine-compensation.jsx`

**STATUS: NEW FEATURE** — Unique value add: EU261/2004 compensation eligibility calculator.

### Purpose
Guide users through EU261/2004 regulations. Let them check compensation eligibility based on flight details (delay duration, disruption reason, airline, route).

### Layout Structure
- **Background:** Cream to sand gradient (180deg vertical)
- **App Bar:** "Compensation Guide"
- **Content:** Form card, result card (animated in)
- **Scrollable:** Flex column with gaps

### Key Components

#### Form Card (GoldCard Elevated)
- **Title:** "Check your eligibility" (22px, Georgia serif, bold)
- **Subtitle:** "EU261/2004 protects you on flights from/to EU airports"
- **Fields (two-column layout where applicable):**
  - Dep Airport (text input)
  - Arr Airport (text input)
  - Airline (select: TAROM, Wizz Air, Ryanair, Lufthansa, KLM)
  - Delay Duration (select: Under 1hr, 1–2hrs, 2–3hrs, 3–4hrs, 4+hrs, Flight cancelled)
  - Disruption Reason (select: Technical issue, Weather, Crew shortage, Strike, Other)
  - Flight Date (date input)
- **CTA:** "Check compensation eligibility →" with sparkle icon (gold button)

#### Input Styling
- Height: 50px
- Border radius: 14px
- Border: 1.5px gold-tinted
- Background: White 0.85 opacity
- Font: Hanken Grotesk, 15px, bold

#### Result Card (Animated, fade-up)
Three possible states:

**1. Eligible (Active state)**
- Emoji: 🎉
- Title: "You may be eligible"
- Amount: "€250 – €600" (large, deep gold)
- Subtitle: "Estimated compensation based on flight distance"
- Gold divider
- "Based on EU261/2004:" heading
- Checkmarked bullets:
  - "Delay exceeded 3 hours"
  - "Technical cause is airline's responsibility"
  - "Route qualifies under EU regulation"
- Buttons:
  - "Generate claim letter" (gold, with FileText icon)
  - "Save to trip" (ivory)

**2. Maybe/Uncertain**
- Icon: Info (amber)
- Title: "More information needed"
- Body: "We need to verify a few details before confirming eligibility."
- Bullet points with amber dots:
  - "Confirm exact delay duration"
  - "Verify boarding denial reason"
  - "Check if compensation was already offered"
- Button: "Contact airline →" (ivory)

**3. Not Eligible**
- Icon: XCircle (muted)
- Title: "Likely not eligible"
- Body: Contextual explanation (weather = extraordinary circumstances, short delay = below threshold)
- Link: "Learn more about your rights →" (underlined)

### Copy & Messaging
- Form title: "Check your eligibility"
- Form subtitle: "EU261/2004 protects you on flights from/to EU airports"
- Labels: "Dep Airport", "Arr Airport", "Airline", "Delay Duration", "Disruption Reason", "Flight Date"
- CTA: "Check compensation eligibility →"
- Eligible result: "🎉 You may be eligible" / "€250 – €600"
- Maybe result: "More information needed"
- Not eligible: "Likely not eligible"
- Link: "Learn more about your rights →"

### Color Palette (Warm/Cream)
```
Espresso:        #2C1A0E
Gold:            #C8A24E / #C49B50
Gold Deep:       #A07A28
Warm Muted:      #9B8A78
Ivory/Cream:     #FFFFF8 → #FAF6EE → #F3EAD8
White:           rgba(255,255,255,0.85)
```

### Styling Notes
- **Form layout:** `display: grid; grid-template-columns: 1fr 1fr; gap: 12px`
- **Select styling:** Custom chevron overlay, no default appearance
- **Result cards:** Gold-bordered cards with elevated shadow
- **Icons:** Lucide icons (Sparkles, CheckCirc, Info2, XCircle2)
- **Loading state:** "Checking..." text on button (1200ms delay)
- **Dividers:** Gold gradient line, 1.5px height

### Tailwind Rebuild Notes
- Background: `linear-gradient(180deg, #fffff8 0%, #faf6ee 50%, #f3ead8 100%)`
- Form grid: `grid grid-cols-2 gap-3`
- Full-width fields: `col-span-2`
- Buttons: Custom gold/ivory variants with full width
- Result cards: `rounded-[12px] border border-gold`
- Animated entrance: `animate-fadeUp`
- Flex column gaps: `flex flex-col gap-4`

---

## 4. HELP SCREEN

**File:** `cine-help.jsx`

**STATUS: NEW FEATURE** — Interactive guided wizard for travel disruptions. Comprehensive help system.

### Purpose
Provide step-by-step guidance for flight disruptions (delay, cancellation, missed connection, denied boarding, lost baggage, overnight stay). Calculate eligibility and suggest next steps.

### Layout Structure

#### Help Home Screen
- **Background:** Cream gradient with sky glow (radial)
- **App Bar:** "Disruption Help"
- **Content:**
  - Intro paragraph
  - "What happened?" section heading
  - 2-column grid of category cards
  - Gold divider
  - Compensation guide card (elevated)

#### Help Wizard Screen
- **App Bar:** "Get Help" with back button
- **Progress dots:** Filled/unfilled indicators
- **Step header:** "Step X of 5" + large question title
- **Scrollable content:** Step-specific renderer
- **Bottom actions:** "Next" button + "Go back" link
- **Last step:** Shows full summary + action buttons

### Key Components

#### Category Cards (Help Home)
Six disruption types:
1. **Delayed** (Clock icon, gold tone)
   - "Your flight is behind schedule"
2. **Cancelled** (XCircle icon, red tone)
   - "Your flight was cancelled"
3. **Missed Connection** (AlertTriangle icon, orange tone)
   - "Couldn't catch your connecting flight"
4. **Denied Boarding** (Shield icon, blue tone)
   - "Refused despite a valid ticket"
5. **Lost Baggage** (Briefcase icon, muted tone)
   - "Your luggage didn't arrive"
6. **Need Overnight Stay** (Bed icon, blue tone)
   - "Stranded and need accommodation"

**Card styling:**
- 2-column grid, gap: 10px
- Icon circle (48×48px, tone-specific background)
- Title (15px, bold, dark)
- Description (12px, muted, 1.4 line height)
- Interactive background

#### Wizard Steps (5 steps)

**Step 0: Confirm Category**
- Display selected category chip with icon + title
- Show category description

**Step 1: Delay Duration** (Single select)
- Options:
  - < 1 hour
  - 1–2 hours
  - 2–3 hours
  - 3–4 hours
  - 4+ hours
  - Flight cancelled
- Radio button style (circle border, filled when selected)

**Step 2: Airline Support Offered** (Multi-select)
- "Select all that apply"
- Options:
  - Nothing offered
  - Meals/vouchers
  - Hotel accommodation
  - Rebooking on next flight
  - Full refund
- Checkbox style with checkmarks

**Step 3: Hotel Needed** (Single select, card style)
- Two card options:
  - "Yes, book me a hotel" (Bed icon, sub: "Find nearby accommodation")
  - "No, I have accommodation" (CheckCirc icon, sub: "I'm sorted for tonight")

**Step 4: Results Summary** (Elevated card)
- **Icon + status bar:**
  - Eligible: CheckCirc (green), "Potentially eligible for compensation"
  - Maybe: Info (gold), "More info needed"
- **Optional compensation box** (if eligible):
  - "€250–600 estimated"
  - "Depending on flight distance"
- **Gold divider**
- **Next steps section:**
  - Numbered list (1–4 items) in gold circles
  - Contextual steps based on eligibility
- **Action buttons:**
  - "Check full compensation →" (gold)
  - "Find hotels nearby →" (ivory)

### Progress Indicator
- Row of dots/bars
- Filled (22px wide) = completed or current
- Unfilled (8px wide) = future steps
- Smooth transition animation

### Copy & Messaging
- Intro: "Experiencing a travel disruption? Select what happened and we'll guide you step by step."
- Step headers vary by step
- Category descriptions (see above)
- Eligibility logic: 3+ hours delay OR flight cancelled = eligible (unless weather)
- Next steps examples:
  - Eligible: "File a formal complaint within 6 years", "Keep receipts", etc.
  - Maybe: "Gather boarding pass", "Document delay", etc.

### Color Palette (Warm/Cream)
```
Espresso:        #2C1A0E
Gold:            #C49B50 / #C8A24E
Gold Deep:       #A07A28
Warm Ink:        varies
Warm Muted:      #9B8A78
Ivory/Cream:     linear-gradient(180deg, var(--ivory) 0%, var(--cream) 60%, var(--sand) 100%)
White:           rgba(255,255,255,0.55–0.88)
```

#### Tone Color Map
```
Gold:   bg: rgba(200,162,78,0.14),  color: var(--accent-deep)
Red:    bg: rgba(185,45,45,0.10),   color: #9B2020
Orange: bg: rgba(210,100,40,0.10),  color: #A8401F
Blue:   bg: rgba(91,143,191,0.14),  color: var(--sky-ink)
Muted:  bg: rgba(74,63,49,0.08),    color: var(--warm-muted)
```

### Styling Notes
- **Button styles:**
  - Active option: Gold border 1.5px, gold background 0.10, bold text
  - Inactive: Light border, white background, regular weight
  - Transition: 0.14s ease on all
- **Progress dots:** Filled when `i <= step`
- **Checkmarks:** SVG inline (11×11px, 2px stroke)
- **Step animation:** Fade-up on each render (`cFadeUp 0.25s`)
- **Backdrop blur:** 16px on bottom action bar

### Tailwind Rebuild Notes
- 2-column grid: `grid-cols-2 gap-2.5`
- Icon circles: `w-12 h-12 rounded-[14px]`
- Progress dots: Conditional `w-[22px]` if filled else `w-2`
- Button rows: `flex flex-col gap-2`
- Radio/checkbox custom: Build with styled divs (no native inputs)
- Step content wrapper: `animate-fadeUp`
- Safe area: `pb-[max(24px, env(safe-area-inset-bottom))]`

---

## Summary: NEW vs. STANDARD FEATURES

### NEW FEATURES (Not typical in flight-alert apps):
- **Hotels Screen** — Full hotel discovery, filtering, sorting, booking
- **Compensation Screen** — EU261/2004 eligibility calculator with dynamic results
- **Help Wizard** — Guided multi-step disruption support system

### STANDARD FEATURE:
- **Profile Screen** — Expected account/settings hub

### Recommended Build Priority
1. **Profile** — Core feature, establishes app structure
2. **Help** — High engagement value, guides users through core app flows
3. **Compensation** — Differentiator, strong regulatory compliance value
4. **Hotels** — Nice-to-have, adds booking ecosystem (consider partnering with hotel APIs)