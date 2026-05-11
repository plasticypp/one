# YPP ERP — Design System Reference

## Color Palette

### Primary — Safety Orange
- `--color-primary: #EA580C` — buttons, active states, tile accents, FAB
- `--color-primary-light: #FB923C` — hover states
- `--color-primary-dark: #C2410C` — active/pressed
- `--color-primary-bg: #FFF7ED` — row hover, tinted surfaces

### Accent — Near-black
- `--color-accent: #0F172A` — header bg, table head bg, drawer bg
- `--color-accent-light: #1E293B` — secondary dark surface

### Neutrals
- `--color-bg: #F8FAFC` — page background
- `--color-surface: #FFFFFF` — cards, panels, inputs
- `--color-border: #E2E8F0` — table borders, card borders
- `--color-divider: #CBD5E1` — input borders
- `--color-text: #0F172A` — primary text
- `--color-text-muted: #64748B` — labels, meta
- `--color-text-subtle: #94A3B8` — placeholders, chevrons

### Semantic
- Success: `#16A34A` / bg `#DCFCE7`
- Warning: `#D97706` / bg `#FEF3C7`
- Error: `#DC2626` / bg `#FEE2E2`
- Info: `#0369A1` / bg `#E0F2FE`

### Status Badges
| Status | Text | Background |
|---|---|---|
| Open | #92400E | #FEF3C7 |
| Closed | #14532D | #DCFCE7 |
| Pending | #0C4A6E | #E0F2FE |
| Overdue | #7F1D1D | #FEE2E2 |
| Planned | #4C1D95 | #EDE9FE |

## Typography

### Fonts
- **Display/Headers:** Barlow Condensed — weight 500/600/700, letter-spacing 0.04–0.06em, text-transform: uppercase always
- **Body:** Barlow — weight 400/500/600

### Scale
| Token | Size | Usage |
|---|---|---|
| --text-xs | 11px | Labels, badges, table headers |
| --text-sm | 13px | Table body, meta, helper text |
| --text-base | 16px | Body copy, form inputs |
| --text-lg | 19px | Section intro |
| --text-xl | 24px | Section titles |
| --text-2xl | 30px | KPI values, stats |

### Weight
- 400 normal, 500 medium, 600 semibold, 700 bold
- Bold + Condensed + uppercase = labels and headings always

## Spacing (8pt grid)
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px

## Radius
- sm: 3px (badges, filter chips)
- md: 4px (cards, inputs, buttons)
- lg: 6px (login card)
- xl: 10px
- full: 9999px (pill badges, FAB)

## Shadows
- sm: `0 1px 3px rgba(15,23,42,0.08)`
- md: `0 2px 8px rgba(15,23,42,0.10)`
- lg: `0 8px 24px rgba(15,23,42,0.12)`

## Animation
- Fast: 120ms ease-out
- Default: 220ms ease-out
- NO bounce, no elastic, no spring on form panels

## Components

### Header
- Height: 56px, bg: `--color-accent`, bottom border: 3px `--color-primary`
- Title: Barlow Condensed Bold, 20px, uppercase, letter-spacing 0.04em

### Bottom Tab Bar
- Height: 60px, white bg, 2px top border
- Active tab: orange, 3px top indicator strip

### Tiles (Home Grid)
- 2-col grid, gap 12px
- White bg, 1px border, **4px left border orange** (deliberate exception to side-stripe ban — structural affordance in this product register)
- Min-height 96px, badge top-right

### Tables
- Dark (`--color-accent`) header with 2px orange bottom border
- White body rows, hover: `--color-primary-bg`
- 11px uppercase condensed bold column headers

### Buttons
| Variant | Bg | Text |
|---|---|---|
| Primary | #EA580C | White |
| Secondary | transparent | Orange, 2px orange border |
| Danger | #DC2626 | White |
| Ghost | transparent | Muted, 1px border |

- All: 40px height, Barlow Condensed Bold, uppercase, letter-spacing 0.04em
- Min touch target: 44px

### Badges / Status Chips
- 11px Barlow Condensed Bold, uppercase, letter-spacing 0.04em
- Pill on radius-sm (3px)

### Form Panels
- Slide in from right (translateX 100% → 0)
- Header: same as page header (dark bg, orange bottom border)
- Body: white, padding 20px 16px

### FAB
- 52px circle, orange bg, white +, box-shadow orange
- Fixed bottom-right, above tab bar

### Toast
- Dark bg with orange left accent, slides up from bottom
- 3 variants: default / success (green) / error (red)
