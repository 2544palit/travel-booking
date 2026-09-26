---
name: SkyHaven Travel Platform
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#994100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c05400'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb690'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783200'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: '0'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: '0'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  container-max: 1280px
---

## Brand & Style

The design system establishes a high-trust, premium travel and hospitality environment tailored for discerning travelers and hospitality partners. It balances navigational clarity with inspiring visual warmth, evoking confidence, calm efficiency, and the anticipation of effortless discovery. 

The aesthetic is grounded in modern corporate hospitality: crystalline whitespace, precise information architecture, structured containers, and micro-interactions that reassure users through complex booking workflows. High legibility, rigorous accessibility standards, and deliberate visual pacing eliminate transactional fatigue while elevating flights, stays, and curated itineraries into engaging visual experiences.

## Colors

The palette leverages high-contrast, atmospheric tones inspired by clear skies, deep maritime horizons, and evening departures:

- **Primary (`#0284C7` - Sky Azure):** The central action color. Applied to primary booking CTAs, selected tab indicators, active calendar ranges, and verified trust badges. Conveys forward motion and clarity.
- **Secondary (`#0F172A` - Deep Oceanic Indigo):** Provides structural weight and authoritative contrast. Used for primary headlines, structural chrome, footer navigation, and premium loyalty tiers.
- **Tertiary (`#F97316` - Sunset Coral):** A warm, attention-directing accent for limited-time offers, high-priority status flags, price drops, and urgent reservation alerts.
- **Neutral (`#64748B` - Slate Grey):** Balances interface noise across borders, secondary iconography, meta labels, and inactive control states.
- **Base Surfaces:** Canvas sits on crisp `#F8FAFC`, with core cards and interactive panels lifted in pristine `#FFFFFF` and framed by subtle `#E2E8F0` outlines.

## Typography

The type system blends the geometric warmth and approachability of **Plus Jakarta Sans** for hero messaging, hotel titles, flight numbers, and modal headers with the neutral, systematic precision of **Inter** for dense transactional metrics, fare breakdowns, filter sidebars, and itinerary timetables.

Headlines employ tight, negative tracking to reinforce structural solidity, while uppercase micro-labels utilize generous letter spacing to maximize glanceability across complex flight segment matrices and policy summaries.

## Layout & Spacing

Layouts follow an 8pt base grid system framed within a responsive 12-column structure:

- **Desktop (≥1024px):** Max container width of 1280px, 12-column grid with 32px gutters and dynamic center-locked margins. Filters and sticky booking summary rails span 4 columns, while search results span 8 columns.
- **Tablet (768px – 1023px):** 8-column layout with 24px gutters and margins. Filters collapse into top-level horizontal scrolling ribbons or slide-over drawer drawers.
- **Mobile (<768px):** 4-column layout with 16px gutters and edge gutters. Cards span full width; multi-segment booking steps switch to stacked vertical milestones.

## Elevation & Depth

Elevation conveys tangible hierarchy through layered atmospheric illumination rather than heavy drop shadows:

- **Level 0 (Flat Canvas):** `#F8FAFC` base page background.
- **Level 1 (Card & Content Surface):** `#FFFFFF` surface with a crisp 1px border (`#E2E8F0`) and an ambient glow: `0px 1px 3px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hover & Interactive Card):** Elevated state during pointer focus: `0px 8px 20px -4px rgba(15, 23, 42, 0.08)`, paired with a border shift to `#CBD5E1`.
- **Level 3 (Flyouts, Popovers & Datepickers):** Floating overlays: `0px 16px 32px -8px rgba(15, 23, 42, 0.12)`, anchored by a 1px border in `#E2E8F0`.
- **Level 4 (Modals & Checkout Sheets):** Top-tier critical focus: `0px 24px 48px -12px rgba(15, 23, 42, 0.18)` positioned above a 40% opacity slate scrim backdrop blur (`backdrop-filter: blur(4px)`).

## Shapes

The design uses a balanced `roundedness: 2` (base 8px radius) to project approachable modernity while maintaining the clean discipline needed for data-dense reservation grids:

- **Buttons, Text Inputs, Segmented Controls:** 8px (`0.5rem`) corner radius.
- **Cards, Flight Segments, Room Modules:** 16px (`1rem` / `rounded-lg`) corner radius.
- **Overlays, Full Search Bars, Modal Dialogs:** 24px (`1.5rem` / `rounded-xl`) corner radius.
- **Badges, Loyalty Chips, Floating Action Tags:** Fully rounded pill radius (`9999px`) to distinguish categorical metadata from actionable rectangular inputs.

## Components

### Buttons
- **Primary:** Background `#0284C7`, text `#FFFFFF`, 8px radius, bold tracking. On hover: `#0369A1` with subtle y-translation (-1px). Focus: 3px outer ring `#BAE6FD`.
- **Secondary:** Background `#0F172A`, text `#FFFFFF`. Applied to final checkout commitments and account management.
- **Tertiary / Ghost:** Border 1px `#CBD5E1`, background `#FFFFFF`, text `#0F172A`. Hover: `#F1F5F9`.

### Form Inputs & Search Fields
- Input enclosures feature 48px height, 8px radius, white fill, and 1px border `#CBD5E1`. 
- Floating labels in `Inter` label-md (`#64748B`) transition seamlessly on active entry. Focus produces a 1px border in `#0284C7` with a 3px soft halo in `rgba(2, 132, 199, 0.15)`.

### Cards & Result Tiles
- Hotel and flight cards use pure white backgrounds framed by `#E2E8F0`. 
- Image carousels feature an internal 12px radius. 
- Flight results emphasize timeline waypoints: solid 8px Sky Azure dots for departures and arrivals, connected by a 2px `#CBD5E1` rule with cabin class indicators floating overhead.

### Chips & Filter Tags
- Multi-select facet tags feature an 8px radius, `#F1F5F9` background, and `#334155` label. 
- Selected filters invert to `#0284C7` background and `#FFFFFF` text, showing a dismissal icon.

### Badges & Status Indicators
- **Exclusive Deal / Urgent:** Pill-shaped, `#FFF7ED` fill, `#F97316` text, 1px border `rgba(249, 115, 22, 0.2)`.
- **Loyalty Status:** Dark sapphire pill (`#0F172A`), metallic gold or sky-blue iconography, uppercase `label-sm`.
- **Cabin & Amenities:** Subtle slate tag (`#F8FAFC`), `#475569` text, 1px `#E2E8F0` border.

### Checkboxes & Radios
- 20px controls with 4px radius (checkbox) or circular boundary (radio). Checked state fills with `#0284C7`, displaying an optical white SVG check or inner pip.