# Aerly Onboarding & Auth Screens – Specification

## Overview
Two distinct design systems are present in the codebase:

1. **Aerly Onboarding** (`onboarding.jsx`) – Clean, modern, Romanian-first UI with plane-in-fog hero
2. **Aerly Cinematic** (`cine-screens.jsx`) – Premium, parallax-driven landing with plane-window hero

This spec covers both flows, which can be remixed.

---

## AERLY ONBOARDING FLOW

### Color Palette
- **Brand primary:** `#5B8FBF` (soft blue)
- **Brand soft bg:** `color-mix(in srgb, var(--brand) 12%, transparent)` (very pale blue)
- **Critical/error:** `#E11D48` (red)
- **Ink (text):** Dark charcoal
- **Ink-muted:** Medium gray
- **Ink-subtle:** Light gray
- **Surface:** Off-white card backgrounds
- **Border:** Light divider `var(--border)` (subtle gray)

---

## Screen 1: Welcome

**Path:** `Welcome` component | Progress: Step 0 of 3

### Layout (Top to Bottom)
- **Safe area top:** 50px padding
- **Hero plane:** 220×220px centered illustration
  - Animated plane icon (92×92) rotated -8deg
  - Soft spotlight gradient (radial)
  - Fog bars at bottom (3 bars, blurred, fading opacity)
  - Drop-shadow on plane
- **Spacing:** 18px above hero, 8px below
- **Logo/Branding:** Small `BrandMark` (20px size)
  - Square badge with plane takeoff icon (white on brand blue)
  - "Aerly" text in display font
  - Positioned above main headline
- **Headline (H1):** "Bine ai venit." (Welcome.)
  - Font: Display serif, 33px, 600 weight, line-height 37px
  - Letter-spacing: -0.025em
  - Color: ink (dark)
  - Margin: 0, natural spacing from hero
- **Subheadline (P):** "Aerly îți spune din timp când zborul tău e la risc de ceață."
  - Font: Inter, 400, 16px, line-height 24px
  - Color: ink-muted (medium gray)
  - Max-width: 300px
  - Margin: 10px top from headline
- **Benefit bullets:** 3 items in column, gap 13px, margin-top 28px
  - **Bullet layout:** Flex row, gap 12px
    - Circular badge (26×26, border-radius 99, brand-bg with brand border)
    - Check icon (16×16)
    - Text: Inter 400 16px/22px, color ink
  - **Content:**
    1. "Predicție cu până la 5 ore în avans"
    2. "Alternative pe WhatsApp, un singur tap"
    3. "Zero instalare. Zero cont."

### Footer
- **Background:** Cream/off-white
- **Content stack:** Flex column, gap 14px, animation `fadeUp .5s .1s both`
  1. **Primary button:** "Continuă" (Continue)
     - Full width
     - Brand blue background
     - Icon right: ArrowRight (20px)
     - Interactive
  2. **Secondary text link:** "Am deja un cont"
     - No background, brand color
     - Font: Inter 500 14px
     - Padding: 4px
  3. **Legal notice:** "Continuând, accepți Termenii și Politica de confidențialitate"
     - Font: Inter 400 11px/16px
     - Color: ink-subtle
     - Text: Underlined links for "Termenii" and "Politica de confidențialitate"

### Styling Details
- **Background:** `linear-gradient(180deg, #FFFFFF 0%, var(--surface-subtle) 100%)` (white to subtle gray)
- **Animation:** Hero fades in with `popIn .6s ease-out both`, content with `fadeUp .5s ease-out both`
- **Safe area:** Top 50px, handled via SAFE_TOP constant

---

## Screen 2: Phone Entry

**Path:** `PhoneScreen` component | Progress: Step 1 of 3

### Layout (Top to Bottom)
- **AppBar:** Back button + step indicator (dots showing 1 of 3 active)
- **Content area:** Padding 28px 24px
- **Headline (H1):** "Care e numărul tău?"
  - Font: Display serif, 30px, 600 weight, line-height 34px
  - Letter-spacing: -0.025em
  - Color: ink
- **Subheading:** "Avem nevoie să-ți trimitem alerte când zborul tău e la risc."
  - Font: Inter 400 14px/20px
  - Color: ink-muted
  - Max-width: 290px
  - Margin: 8px top
- **Label:** "Număr de telefon"
  - Font: Inter 600 11px, uppercase, letter-spacing 0.05em
  - Color: ink-muted
  - Margin-top: 30px, margin-bottom: 8px
- **Phone input container:**
  - Height: 56px
  - Border-radius: 14px
  - Border: 1.5px solid (dynamic color)
    - Default: `var(--border)`
    - Focused: `var(--brand)` blue
    - Error: `var(--critical)` red
  - Background: `var(--surface)` (off-white)
  - Box-shadow on focus: `0 0 0 4px color-mix(in srgb, var(--brand) 12%, transparent)` (blue halo)
  - Flex display, align-stretch
  - **Prefix button (left):**
    - Flag emoji: 🇷🇴
    - Text: "+40"
    - Font: Inter 500 16px
    - Padding: 0 14px
    - Border-right: 1px solid var(--border)
    - Cursor: pointer
  - **Input field (right, flex 1):**
    - Type: "tel", inputMode: "numeric"
    - Placeholder: "0712 345 678"
    - Font: Inter 500 17px, letter-spacing 0.02em
    - Color: ink
    - No border, no outline
    - Padding: 0 14px
    - Background: transparent
- **Error message (conditional):**
  - Appears if validation fails
  - Font: Inter 500 13px/18px
  - Color: `var(--critical-ink)` (red)
  - Icon: X (15px)
  - Text: "Număr invalid. Verifică cifrele."
  - Display: flex, gap 6px, align center
  - Margin: 8px 2px top
- **Help text (default state):**
  - Font: Inter 400 12px/17px
  - Color: ink-subtle
  - Margin: 10px 2px top
  - Content: "**Number Verification de la Orange** ne ajută să te verificăm fără SMS."
    - Orange text in bold (color: brand, font-weight 600)

### Footer
- **Layout:** Flex column, gap 16px
- **Primary button:** "Continuă"
  - Full width
  - Brand blue
  - Disabled until phone valid (10 digits starting with 0)
  - Loading state supported
  - On click: Validate → Set data → Navigate to "verify" (900ms delay)
- **Security notice:**
  - Font: Inter 400 11px/16px
  - Color: ink-subtle
  - Icon: Lock (13px)
  - Text: "Datele tale sunt criptate. Nu le împărtășim cu nimeni."
  - Flex, center-aligned, gap 6px

### Validation
- Strip non-digits
- Require exactly 10 digits
- First digit must be "0"
- Format display: "XXXX XXX XXX" (grouped)

### Animation
- Input autofocus after 350ms delay

---

## Screen 3: Verify (OTP) – Three Phases

**Path:** `VerifyScreen` component | Progress: Step 2 of 3

### Phase A: Orange Number Verification (Auto-advance)

**Duration:** 2400ms, then auto-advance to Phase C or Channel screen

**Layout:**
- **AppBar:** Back button + step dots (2 of 3 active)
- **Center content area:** Flex column, center, justify-center
  - Padding: 0 32px
  - Text-align: center
  - Height: calc(100% - 56px - SAFE_TOP)

**Visual:**
- **Success ring animation:**
  - SVG 112×112
  - Outer circle: light brand blue border (14% opacity)
  - Inner ring: brand blue stroke (4px), animated draw clockwise
  - Animation: `ringDraw .7s cubic-bezier(.3,.7,.3,1) .1s both`
  - Checkmark SVG (46×46, brand color) drawn on top
  - Animation: `drawCheck .4s ease-out .55s both`
  - Container animation: `popIn .5s ease-out both`

**Headline (H1):** "Te-am identificat."
- Font: Display serif, 30px, 600 weight, line-height 34px
- Letter-spacing: -0.025em
- Color: ink
- Margin: 28px top, 0 sides
- Width: 100%

**Subheading:** "Orange a confirmat numărul tău. Continuăm fără SMS."
- Font: Inter 400 16px/23px
- Color: ink-muted
- Max-width: 270px
- Margin: 12px top
- **"Orange" keyword:** Brand blue, font-weight 600

**Loading indicator (below):**
- Spinner icon (15px) + text
- Font: Inter 400 13px
- Color: ink-subtle
- Margin: 36px top
- Text: "Continuăm..."

**Fallback link:** "Folosește SMS în schimb"
- Font: Inter 500 14px
- Color: brand blue
- No border, cursor pointer
- Margin: 28px top
- Toggles to Phase B (OTP input)

---

### Phase B: SMS OTP Entry (On Demand)

**Triggered by:** User clicks "Folosește SMS în schimb" OR Orange verification fails

**Headline (H1):** "Verifică numărul"
- Font: Display serif, 30px, 600 weight
- Color: ink
- Margin: 0

**Subheading:** "Am trimis un cod la +40 [masked]"
- Font: Inter 400 16px/23px
- Color: ink-muted
- Masked phone: "+40 " + digits (replace first digit 0 with area code) + obfuscate middle digits with "•"
- Example: "+40 712 ••• •78"
- Last number in strong tag

**OTP Input Grid:**
- 6 input fields in horizontal flex row, gap 8px
- Each input:
  - Width: flex 1
  - Height: 60px
  - Border-radius: 12px
  - Border: 1.5px solid (dynamic)
    - Empty: `var(--border)` (light gray)
    - Filled: `var(--brand)` (blue)
  - Background (dynamic)
    - Empty: `var(--surface)`
    - Filled: `var(--brand-bg)` (pale blue)
  - Font: Monospace 600 24px ("JetBrains Mono" fallback)
  - Color: ink
  - Input type: tel, inputMode: numeric, maxLength 1
  - On focus: Brand blue border + 4px brand halo shadow
  - On blur: Shadow removed, border reverts if empty
  - Transition: border-color .15s, background .15s

**Resend timer (below grid):**
- Margin-top: 24px
- Text-align: center
- **If count > 0:**
  - Clock icon (15px) + "Retrimite cod în {count}s"
  - Font: Inter 400 14px
  - Color: ink-subtle
- **If count <= 0:**
  - "Retrimite cod" button (blue text)
  - Font: Inter 600 14px
  - No background, cursor pointer
  - On click: Reset count to 30

**Change number link (below):**
- Margin-top: 22px
- Text-align: center
- "Greșit numărul? Schimbă" + ArrowRight icon (16px)
- Font: Inter 500 14px
- Color: brand blue
- Flex, gap 4px, center-aligned
- On click: Navigate back to phone entry

**Auto-complete behavior:**
- When all 6 fields filled → 350ms delay → Auto-advance to Phase C

---

### Phase C: Success Confirmation (Auto-advance)

**Duration:** 1500ms, then auto-advance to Channel screen

**Layout:** Same as Phase A (center flex column)

**Visual:**
- **Success ring with confetti:**
  - Same SVG ring as Phase A
  - **Confetti animation (14 particles):**
    - Colors: brand, low, light-blue, violet, moderate
    - Particles: 7px × 7px (alternating circles/squares)
    - Arrangement: Radial from center (PI * 2 angles)
    - Animation: `confettiOut .7s ease-out` staggered by (0.5 + i%5*0.03)s
    - Keyframe: 0% opacity 0 scale 0 → 40% opacity 1 → 100% opacity 0 at dx/dy offset, scale 1
  - Container animation: `popIn .5s ease-out both`

**Headline (H1):** "Verificat!"
- Font: Display serif, 30px, 600 weight
- Color: ink
- Margin: 28px top

**Subheading:** "Numărul tău e confirmat."
- Font: Inter 400 16px/23px
- Color: ink-muted
- Margin: 12px top

---

## Screen 4: Channel Preferences

**Path:** `ChannelScreen` component | Progress: Step 3 of 3 (final)

### Layout (Top to Bottom)
- **AppBar:** Back button + step dots (3 of 3 active)
- **Content area:** Padding 24px
- **Headline (H1):** "Cum vrei să-ți spunem?"
  - Font: Display serif, 30px, 600 weight, line-height 34px
  - Color: ink
  - Margin: 0
- **Subheading:** "Poți schimba oricând. Recomandăm să lași toate active pentru siguranță."
  - Font: Inter 400 16px/23px
  - Color: ink-muted
  - Max-width: 300px
  - Margin: 8px top, 24px bottom

### Channel Cards (Flex Column, Gap 12px)

**Card A: WhatsApp (Recommended)**
- **Icon badge:** 42×42, border-radius 12, background `#25D366` (WhatsApp green)
  - Icon: MessageCircle (22px, strokeWidth 2)
  - Color: white
- **Title:** "WhatsApp"
  - Font: Inter 600 17px/1.1
  - Color: ink
- **Recommended badge:** Small "Recomandat" pill (gold/brand color)
- **Subtitle:** "Mesaje cu butoane interactive"
  - Font: Inter 400 14px/19px
  - Color: ink-muted
  - Margin-top: 3px
- **Checkbox (right side):** 24×24
  - Unchecked: Border 1.5px `var(--border)`, background `var(--surface)`
  - Checked: Brand blue background, white checkmark (15px, strokeWidth 3)
  - Transition: all .15s
- **Card styling:**
  - Padding: 16px
  - Border-radius: `var(--card-radius)` (theme-dependent: 12–28px)
  - Cursor: pointer
  - Border: 1.5px solid (dynamic)
    - Unchecked: `var(--border)`
    - Checked: `var(--brand)`
  - Background (dynamic)
    - Unchecked: `var(--surface)`
    - Checked: `var(--brand-bg)` (pale blue)
  - Box-shadow: `var(--shadow-card)` if unchecked, none if checked
  - Transition: all .18s
  - On click: Toggle selection

**Card B: SMS**
- **Icon badge:** 42×42, background `var(--brand)` (blue)
  - Icon: MessageSquare (22px, strokeWidth 2)
- **Title:** "SMS"
- **Subtitle:** "Pentru zone fără internet"
- **Checkbox:** Same as Card A
- **Default:** Checked

**Card C: Push Notifications**
- **Icon badge:** 42×42, background `var(--ink-muted)` (gray)
  - Icon: Bell (22px, strokeWidth 2)
- **Title:** "Notificări push"
- **Subtitle:** "Doar dacă instalezi appul ca PWA"
- **Checkbox:** Same as Card A
- **Default:** Unchecked

### Validation
- **Minimum 1 channel required:** If user tries to deselect last active channel, show toast: "Lasă cel puțin un canal activ pentru siguranță."

### Footer
- **Layout:** Flex column, gap 12px
- **Primary button:** "Salvează preferințe"
  - Full width
  - Brand blue
  - On click:
    1. Save `channels` data to app state
    2. Navigate to "home" screen
    3. Show toast: "Preferințe salvate. Te ținem la curent."
- **Secondary link:** "Sări peste, decidem mai târziu"
  - Font: Inter 500 14px
  - Color: brand blue
  - No background, cursor pointer
  - Padding: 4px
  - On click: Navigate to "home" without saving

---

## CINEMATIC VARIANT (Alternative Flow)

The `cine-screens.jsx` implements a premium, parallax-driven login flow. Key differences:

### Screen: Landing (Intro + Login Hybrid)

**Hero section (sticky, parallax):**
- **Background image:** `src/assets/login-plane-window.png.png` (plane window view, likely from inside cabin)
- **Image transforms:**
  - Scale: 1.06 → 1.48 (based on scroll progress)
  - TranslateY: 0 → -16px (parallax depth)
  - ObjectFit: cover
  - ObjectPosition: 50% 48% (centered, slightly up)
- **Gradient overlays:** Multiple layers for readability
  - Top gradient: Dark (`rgba(18,12,7, 0.62–0.8)` at top)
  - Middle gradient: Fades to transparent at 34–56%
  - Bottom gradient: Dark (`rgba(20,14,8, 0.45–0.75)` for text readiness)
  - Dim overlay: `rgba(18,12,7, 0.16–0.62)` (progressive darkening)
- **Background color:** Dark brown `#1d1610` (fallback)

**Top wordmark (sticky, fades on scroll):**
- `CWord` component (size 17, light style)
- Opacity: 1 → 0.15 (over scroll progress)
- TranslateY: 0 → -10px (subtle rise)
- CSAFE_TOP: 50px padding

**Tagline area (over upper third of hero, fades on scroll):**
- Badge: "Your calm copilot"
  - Inline-flex, gap 7px
  - Padding: 6px 13px
  - Border-radius: 999 (pill)
  - Background: `rgba(255,255,255,0.12)` with `blur(8px)` backdrop
  - Border: 1px `rgba(200,162,78,0.35)` (golden accent)
  - Icon: Sparkles (13px)
  - Font: Hanken Grotesk 600 11px, uppercase, letter-spacing 0.16em
  - Color: `rgba(255,255,255,0.92)` (bright white)
  - Margin-bottom: 18px
- Headline: "Clarity when <br/> flights go wrong."
  - Font: Display serif (Instrument Serif), 35px, line-height 1.06
  - Second line: Italic, color `var(--sky-soft)` (light sky blue)
  - Color: white
  - Text-shadow: `0 2px 30px rgba(0,0,0,0.6)`
  - Margin: 0
  - Letter-spacing: 0.01em
- Container opacity: 1 → ~-0.15 (fades above 1, so disappears by ~85% scroll)
- TranslateY: 0 → -26px
- Scale: 1 → 0.96

**Scroll hint button (lower third, fades out):**
- Centered, bottom of hero
- Flex column, center items, gap 6px
- Background: none, border: none, cursor: pointer
- Color: `rgba(255,255,255,0.9)`
- Opacity: Math.max(0, 1 - scroll*2.2) (fades quickly)
- Padding: 0 32px
- **Description text:**
  - Max-width: 270px
  - Font: Hanken Grotesk 400 14px/21px
  - Color: `rgba(255,255,255,0.8)`
  - Text-shadow: `0 1px 14px rgba(0,0,0,0.4)`
  - Margin: 0 0 10px
  - Content: "Plan your flight disruption with a clear head — alternatives, rights and next steps, all in one calm place."
- **Action label:**
  - Font: Hanken Grotesk 600 11px, uppercase, letter-spacing 0.16em
  - Content: "Get started"
- **Chevron icon:**
  - ChevronDown (22px)
  - Animation: `hintBob 1.8s ease-in-out infinite` (gentle bob up/down)

**Scroll distance spacer:** 70% of container height

**Login card (rises over hero, z-index 2):**
- Margin-top: -28px (negative, overlaps hero)
- Padding: 10px 22px 24px
- Border-radius: 28px 28px + `var(--card-r)` var(--card-r) (rounded top, theme-dependent bottom)
- Background: `rgba(251,246,236,0.94)` (warm cream, slightly transparent) + `blur(22px) saturate(140%)`
- Border: 1px `rgba(200,162,78,0.42)` (golden)
- Box-shadow: Multiple layers
  - `0 -10px 40px rgba(20,14,8,0.3)` (depth above)
  - `inset 0 1px 0 rgba(255,255,255,0.8)` (highlight inner top)
  - `inset 0 0 0 0.5px rgba(200,162,78,0.12)` (subtle golden inner border)
- **Drag handle (visual):** 42×5px bar, border-radius 999, background `rgba(200,162,78,0.22)`, margin 0 auto 20px
- **Headline (H2):** "Welcome aboard."
  - Font: Display serif (Instrument Serif), 30px, line-height 1.05
  - Color: `var(--espresso)` (dark brown)
  - Margin: 0
- **Subheading:** "Sign in with your phone number to continue."
  - Font: Hanken Grotesk 400 14px/20px
  - Color: `var(--warm-muted)` (muted tan)
  - Margin: 7px 0 22px
- **Phone label:** `<CLabel>Phone number</CLabel>`
- **Phone input field:** `<CPhoneField>` (similar to Aerly onboarding but styled for premium gold theme)
- **Continue button:**
  - Full width, variant "gold"
  - Icon right: ArrowRight (20px)
  - Disabled until phone valid (10 digits, starts with 0)
  - Margin-top: 20px
- **Divider:** 1px tall, gradient `linear-gradient(to right, transparent, rgba(200,162,78,0.2) at 30%, ... 70%, transparent)`
  - Margin: 16px 0 14px
- **Account creation prompt:**
  - Text: "Don't have an account? Create one"
  - Font: Hanken Grotesk 400 13px/1.5
  - Color: `var(--warm-muted)`
  - "Create one" link: color `var(--accent-deep)`, font-weight 600, cursor pointer
  - On click: Navigate to "create" screen
  - Margin: 0, text-align center
- **Security notice:**
  - Font: Hanken Grotesk 400 11px/1.4
  - Color: `var(--warm-faint)` (very light tan)
  - Icon: Lock (13px)
  - Text: "We'll text you a one-time code to verify it's you."
  - Display: flex, center, gap 6px
  - Margin: 16px 0 0

### Phone validation
- 10 digits required, first digit must be "0"
- Special path: If number starts with "0700", navigate to "notfound" (not found screen)
- Otherwise: Navigate to "otp" (verify screen)

### Scroll behavior
- Container: `overflow-y: auto`, overflow-x hidden, height 100%
- Scroll progress: 0..1, based on scrollTop / (clientHeight * 0.7)
- Smooth scrollTo on button click

---

## OTP Verify (Cinematic Variant)

**Screen:** `CVerify`

### Layout
- **Scaffold:** `CreamScreen` (shared cream gradient background)
- **Content area:** Scrollable, padding 8px 24px top
- **Back button:** `CBar` component with back handler

### Headline (H1)
- "Verify your number"
- Font: Display serif, 31px, line-height 1.06
- Color: `var(--espresso)`
- Margin: 0
- Width: 100%
- Animation: `cFadeUp .5s ease-out both`

### Subheading
- "We sent a code to"
- Font: Hanken Grotesk 400 15px/22px
- Color: `var(--warm-muted)`
- Margin: 10px 0 0
- **Masked number (bold):**
  - "+40 " + (strip leading 0 from phone) + obfuscate middle digits with "•"
  - Example: "+40 712 ••• •78"
  - Font-weight: 600
  - Color: `var(--espresso)`
  - Letter-spacing: 0.02em

### OTP Input Container
- Margin: 30px 0 0
- Padding: 20px
- Border-radius: 18px
- Background: `rgba(255,255,255,0.55)` + `blur(8px)`
- Border: 1px `rgba(200,162,78,0.25)` (golden)
- Box-shadow:
  - `0 4px 16px rgba(33,24,14,0.06)` (soft depth)
  - `inset 0 1px 0 rgba(255,255,255,0.8)` (highlight)
- **OTP component:** `<COTP onComplete={() => app.go("main")} />`

### Resend Timer
- Margin-top: 22px
- Text-align: center
- **If count > 0:** Clock icon (15px) + "Resend code in {count}s"
  - Font: Hanken Grotesk 400 14px
  - Color: `var(--warm-faint)`
- **If count <= 0:** "Resend code" link (brand accent color, font-weight 600)
  - On click: setCount(28)

### Change Number Link
- Margin-top: 14px
- Text-align: center
- Text: "Wrong number? Change it"
- Font: Hanken Grotesk 500 14px (slightly bolder)
- Color: Brand accent
- On click: Navigate back to landing

### Footer
- Text-align: center
- Font: Hanken Grotesk 400 12px/1.5
- Color: `var(--warm-faint)`
- Content: "Enter the 6-digit code to continue."

---

## Account Not Found (Cinematic Variant)

**Screen:** `CNotFound`

### Layout
- **Scaffold:** `CreamScreen` with footer
- **Center content:** Min-height 100%, flex column, center, padding-bottom 30px

### Status card
- Padding: 22px
- Border-radius: 20px
- Margin-bottom: 28px
- Background: `rgba(255,255,255,0.52)` + `blur(14px)`
- Border: 1px `rgba(200,162,78,0.25)`
- Box-shadow: `0 4px 20px rgba(33,24,14,0.07)` + `inset 0 1px 0 rgba(255,255,255,0.8)`
- Animation: `cFadeUp .5s ease-out both`

**Icon badge:**
- 58×58px, border-radius 999
- Display: grid, place-items center
- Background: `rgba(255,255,255,0.7)`
- Border: 1px `rgba(200,162,78,0.25)`
- Color: `var(--warm-muted)`
- Icon: Search (26px)
- Margin-bottom: 18px

**Headline (H1):** "No account found"
- Font: Display serif, 31px, line-height 1.06
- Color: `var(--espresso)`
- Margin: 0, width 100%

**Message:**
- Font: Hanken Grotesk 400 15px/23px
- Color: `var(--warm-muted)`
- Margin: 12px 0 0
- Content: "We couldn't find an account with **+40 [number]**. Create one in a few seconds — no email needed."
- Bold number: font-weight 600, color `var(--espresso)`

### Footer buttons
- Flex column, gap 12px
- **"Create account" button:**
  - Full width, variant "gold"
  - Icon right: ArrowRight (20px)
  - On click: Navigate to "create" screen
- **"Try another number" button:**
  - Full width, variant "ghost"
  - On click: Navigate back

---

## Create Account (Cinematic Variant)

**Screen:** `CCreate`

### Layout
- **Scaffold:** `CreamScreen` with footer
- **Content area:** Padding-top 18px, animation `cFadeUp .5s ease-out both`

### Headline (H1)
- "Create your account"
- Font: Display serif, 31px, line-height 1.06
- Color: `var(--espresso)`
- Margin: 0, width 100%

### Subheading
- "Just two details and you're ready to fly."
- Font: Hanken Grotesk 400 15px/22px
- Color: `var(--warm-muted)`
- Margin: 10px 0 26px

### Form container
- Padding: 20px
- Border-radius: 18px
- Background: `rgba(255,255,255,0.5)` + `blur(10px)`
- Border: 1px `rgba(200,162,78,0.25)`
- Box-shadow: `0 4px 16px rgba(33,24,14,0.06)` + `inset 0 1px 0 rgba(255,255,255,0.8)`
- **Phone label + field**
- **Spacer:** 18px
- **Username label + field**
  - Placeholder: "e.g. Maria"
  - Prefix: "@"
  - AutoFocus: true

### Account link
- Text: "Already have an account? Log in"
- Font: Hanken Grotesk 400 13px/1.5
- Color: `var(--warm-muted)`
- "Log in" link: color `var(--accent-deep)`, font-weight 600, cursor pointer
- Margin: 26px 0 0
- Text-align: center
- On click: Navigate back

### Footer button
- Full width, variant "gold"
- Disabled until: 10-digit phone valid AND username >= 2 chars
- Icon right: ArrowRight (20px)
- On click: Save data + navigate to "success"

---

## Success (Cinematic Variant)

**Screen:** `CSuccess`

### Layout
- **Full height flex column:** Center items, justify center, text-align center
- **Padding:** 0 34px
- **Background:** `linear-gradient(180deg, var(--sky-soft) 0%, var(--ivory) 50%, var(--sand-soft) 100%)` (sky-to-sand fade)
- **Auto-redirect:** After 1700ms, navigate to "main" app screen

### Ring container
- **Padding:** 20px
- **Border-radius:** 999 (perfect circle)
- **Background:** `rgba(255,255,255,0.5)`
- **Border:** 1px `rgba(200,162,78,0.3)`
- **Box-shadow:**
  - `0 0 0 8px rgba(200,162,78,0.07)` (outer golden halo)
  - `0 8px 24px rgba(33,24,14,0.08)` (depth)
- **Animation:** `cScaleIn .5s ease-out both` (pop-in grow)
- **Content:** `<CRing />` component

### Headline (H1)
- "You're all set"
- Font: Display serif, 31px, line-height 1.06
- Color: `var(--espresso)`
- Margin: 26px 0 0
- Width: 100%

### Subheading
- "Welcome aboard[, {username}]. Taking you in…"
- Font: Hanken Grotesk 400 15px/22px
- Color: `var(--warm-muted)`
- Margin: 12px 0 0

---

## Color Reference

### Aerly Onboarding
| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#5B8FBF` | Primary buttons, active states, focus rings |
| `--brand-bg` | pale blue (~12% mix with white) | Input background, card highlight |
| `--critical` | `#E11D48` | Error borders, validation messages |
| `--ink` | Dark charcoal | Headlines, primary text |
| `--ink-muted` | Medium gray | Subheadings, labels |
| `--ink-subtle` | Light gray | Help text, disabled state |
| `--surface` | Off-white | Card backgrounds |
| `--surface-subtle` | Very pale gray | Gradient end, backdrop |
| `--border` | Light gray | Dividers, default borders |

### Aerly Cinematic
| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#C8A24E` | Golden accents (default, customizable) |
| `--accent-deep` | 76% accent + black | Darker links |
| `--accent-soft` | 55% accent + white | Soft highlights |
| `--espresso` | Dark brown | Text, headlines |
| `--warm-muted` | Muted tan | Subtext |
| `--warm-faint` | Very light tan | Minimal text |
| `--sky-soft` | Light sky blue | Accent italic text |
| `--ivory` | Off-white cream | Background |
| `--cream` | Warm cream | Gradient stops |
| `--sand-soft` | Pale sand | Background gradients |
| `--gold` / `--gold-soft` | Golden variants | Icons, accents |

---

## Tailwind Implementation Notes

1. **Custom colors:** Define `--brand`, `--ink`, etc. as CSS variables in `:root`, then reference via `text-[var(--brand)]`
2. **Animations:**
   - `fadeUp`: 300ms, opacity + translateY(-20px) → full
   - `popIn`: 600ms ease-out, scale(0.8) → 1, opacity 0 → 1
   - `cFadeUp`: 500ms ease-out
   - `ringDraw`: SVG stroke-dashoffset animation
   - `drawCheck`: Similar SVG path animation
   - `confettiOut`: Radial burst with scale + opacity
   - `hintBob`: 1.8s infinite, slight vertical pulse
3. **Gradients:** Use `linear-gradient()` and `radial-gradient()` inline or as Tailwind `bg-gradient-to-*` classes with stops
4. **Backdropfilter:** Tailwind `backdrop-blur-*` + `-webkit-backdrop-filter` for Safari
5. **Box-shadow:** Multiple shadows via `boxShadow` inline or chained
6. **Border-radius:** Theme-dependent via `--card-radius` CSS variable (12–28px per theme)
7. **Icons:** Use Lucide React icons (ArrowRight, Lock, Sparkles, etc.) – already imported in code

---

## Transitions & Timing

| Interaction | Duration | Easing | Effect |
|-------------|----------|--------|--------|
| Input focus | 200ms | linear | Border + shadow |
| Button press | Instant | — | Visual feedback via opacity/scale |
| Phase advance (Verify) | 350ms | — | Input completion → OTP done |
| Success screen | 1700ms | — | Auto-advance to home |
| Welcome → Phone | Smooth scroll | — | Hero parallax zoom + login rise |
| Phone → Verify | 900ms delay | — | Loading state then nav |
| Confetti | 700ms | ease-out | Radial burst + fade |

---

## Responsive Breakpoints

- **Mobile (default):** Full-width, 402px phone mockup width
- **Tablet/Desktop:** 720px breakpoint for dev rail visibility (Cinematic only)
- **Scaling:** Entire prototype scales via transform `scale()` to fit available space (max 1x)

---

## Accessibility & Validation

- **Phone validation:** Strip non-digits, require 10 chars, first = "0" (Romanian numbering)
- **OTP:** Auto-focus first field, arrow keys navigate, backspace deletes, all fields fill auto-advance
- **Error states:** Clear messaging, icon + color, inline next to input
- **Focus rings:** 4px blue halo on inputs
- **Minimum 1 channel:** Toast warning if user tries to disable all notifications
- **Back navigation:** Full history stack, back button always available (except welcome screen)