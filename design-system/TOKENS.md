# AraHaven Design System — Tokens

Source of truth: `src/app/globals.css` (`@theme` block and theme-specific blocks).

---

## Typography

| Token | CSS Variable | Loaded via |
|---|---|---|
| Heading font | `--font-heading` | Playfair Display (next/font, `--font-playfair`) → Georgia → serif |
| Body font | `--font-sans` | Inter (next/font, `--font-inter`) → system-ui → sans-serif |

**Tailwind utilities:**
- `font-heading` — applies `--font-heading` (defined via `@utility` in globals.css)
- Default body text uses `font-sans` automatically

---

## Color Tokens (all themes)

| CSS Variable | Purpose |
|---|---|
| `--primary` | Brand color — forest green (light), vibrant green (dark), rose (exotic) |
| `--primary-hover` | Darker shade for hover states |
| `--primary-light` | Subtle tint for backgrounds, badges |
| `--secondary` | Supporting brand — teal (light/dark), purple (exotic) |
| `--secondary-hover` | Darker secondary |
| `--accent` | Highlight/gold — premium gold (light), warm yellow (dark/exotic) |
| `--accent-hover` | Darker accent |
| `--accent-light` | Soft accent tint |
| `--bg-premium` | Page background |
| `--text-premium` | Primary text color |
| `--muted-text` | Secondary / subdued text |
| `--surface` | Slightly elevated surface (above bg-premium) |
| `--border-subtle` | Hairline borders, dividers |

### Input tokens

| CSS Variable | Purpose |
|---|---|
| `--input-bg` | Input field background |
| `--input-border` | Input field border |
| `--input-text` | Typed text color |
| `--input-placeholder` | Placeholder text color |

### Card / Container tokens

| CSS Variable | Purpose |
|---|---|
| `--card-bg` | Card and panel background |
| `--card-border` | Card border |
| `--dropdown-bg` | Floating dropdown/popover background |
| `--modal-bg` | Modal/drawer overlay background |
| `--table-row-hover` | Table row hover background |

---

## Theme HSL Values

| Token | Light | Dark | Exotic |
|---|---|---|---|
| `--primary` | `145 60% 26%` | `142 70% 45%` | `340 80% 55%` |
| `--secondary` | `168 80% 27%` | `174 75% 45%` | `260 65% 55%` |
| `--accent` | `35 76% 43%` | `45 90% 55%` | `40 95% 55%` |
| `--bg-premium` | `0 0% 96%` | `220 20% 10%` | `20 50% 97%` |
| `--text-premium` | `0 0% 10%` | `220 10% 95%` | `260 40% 15%` |

---

## Spacing & Radius Conventions

| Context | Tailwind class |
|---|---|
| Page container max-width | `max-w-7xl` |
| Section horizontal padding | `px-4 sm:px-6 lg:px-8` |
| Section vertical padding | `py-12 sm:py-16` |
| Card border radius | `rounded-3xl` |
| Button/input border radius | `rounded-xl` |
| Badge border radius | `rounded-full` |
| Small chip/tag | `rounded-lg` |

---

## Animation Tokens

| Token | Value | Usage |
|---|---|---|
| `animate-float` | `float 4s ease-in-out infinite` | Decorative floating elements |
| `animate-pulse-slow` | `pulse 3s cubic-bezier(0.4,0,0.6,1) infinite` | Loading skeletons |
| `animate-shimmer` | `shimmer 2s linear infinite` | Shimmer loaders |
| `animate-fade-slide` | `fadeSlide 0.35s ease-out` | Dropdown/panel entrance |

---

## Dark Mode

Theme is set via `data-theme` attribute on `<html>` (managed by AppContext).  
Valid values: `light` | `dark` | `exotic`

The `@custom-variant dark` directive in globals.css bridges Tailwind's `dark:` prefix:
```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```
This means `dark:text-white` works identically to `[data-theme=dark]:text-white`.

---

## Status & Rarity Colors (hardcoded)

| Status | Class |
|---|---|
| AVAILABLE | `bg-emerald-600` |
| RESERVED | `bg-amber-600` |
| SOLD | `bg-red-600` |

| Rarity | Style |
|---|---|
| EXCEPTIONAL | `bg-accent text-white` + Sparkles icon (gold) |
| RARE | `bg-violet-600 text-white` |
| COMMON | `bg-white/95 text-primary border border-black/[0.03]` |
