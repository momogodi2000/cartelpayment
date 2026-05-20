# AraHaven Design System — Color Reference

Always use semantic CSS variables. Do not scatter raw hex values through components.

---

## Brand Palette (Light Theme)

| Name | HSL | Hex Approx | Usage |
|---|---|---|---|
| Primary — Forest Green | `145 60% 26%` | `#1A6B3C` | Buttons, links, badges, borders |
| Secondary — Exotic Teal | `168 80% 27%` | `#0D7C66` | Supporting brand accent |
| Accent — Premium Gold | `35 76% 43%` | `#C07A1A` | Prices, highlights, EXCEPTIONAL badges |
| Background | `0 0% 96%` | `#F5F5F5` | Page background |
| Text | `0 0% 10%` | `#1A1A1A` | Primary text |
| Muted | `0 0% 45%` | `#737373` | Labels, placeholders, secondary text |

## Brand Palette (Dark Theme)

| Name | HSL | Usage |
|---|---|---|
| Primary — Vivid Green | `142 70% 45%` | Same role as light primary |
| Secondary — Bright Teal | `174 75% 45%` | Supporting accent |
| Accent — Warm Yellow | `45 90% 55%` | Highlights |
| Background — Deep Slate | `220 20% 10%` | Page background |
| Text — Near White | `220 10% 95%` | Primary text |

## Brand Palette (Exotic Theme)

| Name | HSL | Usage |
|---|---|---|
| Primary — Rose | `340 80% 55%` | Same role as primary |
| Secondary — Purple | `260 65% 55%` | Supporting accent |
| Accent — Warm Amber | `40 95% 55%` | Highlights |
| Background — Blush | `20 50% 97%` | Page background |
| Text — Deep Purple | `260 40% 15%` | Primary text |

---

## Semantic Status Colors (Tailwind utility classes — same across themes)

| Status | Class | Hex |
|---|---|---|
| Success / Available | `emerald-600` | `#059669` |
| Warning / Reserved | `amber-600` | `#D97706` |
| Error / Sold | `red-600` | `#DC2626` |
| Info | `blue-600` | `#2563EB` |

## Rarity Colors

| Rarity | Tailwind class | Visual |
|---|---|---|
| EXCEPTIONAL | `bg-accent text-white` | Gold |
| RARE | `bg-violet-600 text-white` | Purple |
| COMMON | `bg-white/95 text-primary border` | Outlined |

---

## Usage Rules

1. **Never use raw hex** in component files — always reference `bg-primary`, `text-primary`, `border-accent`, etc.
2. **Opacity modifiers** are allowed on semantic colors: `bg-primary/10`, `text-text-premium/60`
3. **Hardcoded Tailwind colors** (emerald, amber, red, violet) are permitted for status/rarity indicators
4. **Input fields** must use `bg-[hsl(var(--input-bg))]`, `border-[hsl(var(--input-border))]`, `text-[hsl(var(--input-text))]`
5. **Cards / glass surfaces** use `bg-white dark:bg-black/15` with the `glass` utility class for the backdrop blur effect
