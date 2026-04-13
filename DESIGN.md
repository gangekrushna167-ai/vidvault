# Design Brief

## Direction
Cinematic Editorial — A premium video library interface designed like a minimalist film curator's workspace.

## Tone
Dark, sophisticated, focused — eschewing playful animations and bright colors in favor of refined restraint and clear hierarchy. Every pixel serves content.

## Differentiation
Warm gold accent color (0.62 0.19 55) paired with deep charcoal backgrounds creates a premium, cinematic aesthetic that feels like curated film library software.

## Color Palette

| Token          | OKLCH            | Role                                  |
|----------------|------------------|---------------------------------------|
| background     | 0.12 0 0         | Deep dark canvas for video focus      |
| foreground     | 0.93 0 0         | Primary text, readable on dark        |
| card           | 0.17 0 0         | Video card + content containers       |
| primary        | 0.62 0.19 55     | Warm gold — primary actions, add/play |
| accent         | 0.68 0.16 45     | Lighter gold — secondary highlights   |
| destructive    | 0.57 0.21 29     | Red-orange for delete/remove actions  |
| sidebar        | 0.14 0 0         | Navigation background, darkest shade  |
| muted          | 0.28 0 0         | Disabled/inactive states              |

## Typography
- Display: Fraunces (serif, 600–700 weight) — collection titles, library headings
- Body: DM Sans (sans-serif, 400–500) — metadata, UI labels, descriptions
- Mono: Geist Mono (monospace, 400) — file size, duration, technical info
- Scale: h1 text-3xl font-display font-bold, h2 text-xl font-display font-semibold, body text-sm font-body

## Elevation & Depth
Layered surface hierarchy via dark backgrounds (sidebar 0.14, cards 0.17, popover 0.22) with subtle shadows (shadow-card, shadow-elevated) — no bright highlights or glows.

## Structural Zones

| Zone    | Background | Border       | Notes                                |
|---------|------------|--------------|--------------------------------------|
| Sidebar | 0.14 0 0   | 0.22 0 0     | Dark nav, collection filter          |
| Header  | 0.17 0 0   | 0.24 0 0     | Title + search bar above grid        |
| Content | 0.12 0 0   | —            | Main video grid, card-based          |
| Footer  | 0.14 0 0   | 0.22 0 0     | Pagination/load more (if needed)     |

## Spacing & Rhythm
Tight spacing (gap-3, gap-4) for grid density; generous vertical rhythm between sections (mb-8); 16px padding inside cards.

## Component Patterns
- Buttons: Primary (gold bg, dark text), Secondary (muted bg, light text), Icon (transparent, gold on hover)
- Cards: 8px border-radius, 0.17 background, shadow-card, hover:bg-card/80 for interaction
- Badges: Display file type/duration as compact pills with muted background
- Forms: Dark input (0.24 0 0), gold focus ring, minimal placeholder text

## Motion
- Entrance: Staggered fade-in for video grid (100ms per card, no bounce)
- Hover: Subtle bg shift + shadow increase on cards (150ms ease-out)
- Loading: Pulse animation on skeleton cards (2s loop, opacity 0.5→0.7)

## Constraints
- No gradients, no bright neons, no decorative blur orbs
- Every color must be OKLCH; no hex literals or arbitrary Tailwind classes
- Gold primary color only for actionable elements (buttons, active states, hover effects)
- Maintain dark mode exclusively — no light theme implementation

## Signature Detail
Warm gold accent color on a dark, focused UI creates a "museum label on gallery wall" aesthetic — immediately signaling premium content curation without excess ornament.
