# AraHaven Design System — Component Reference

All components live in `src/components/`. They must support focus states, all three themes, responsive layouts, and accessible labels.

---

## Layout Components

### `Header` (`src/components/layout/Header.tsx`)
Global navigation bar. Renders a "Discover" dropdown grouping Gallery / About / Blog.

Props: none (reads from AppContext + cart context)

Key behaviors:
- Primary links: Home, Catalog, Contact (always visible)
- Discover dropdown: Gallery, About, Blog (desktop hover/click, mobile collapsible)
- Login button when unauthenticated, Dashboard button when `auth_logged_in` cookie present
- Language toggle (EN / FR) and theme cycle button
- Cart badge with item count

### `Footer` (`src/components/layout/Footer.tsx`)
Brand footer with nav links, newsletter form, social links.

---

## Feature Components

### `ParrotCard` (`src/components/features/ParrotCard.tsx`)
Product card for the catalog grid.

| Prop | Type | Notes |
|---|---|---|
| `parrot` | `AppParrot` | Full parrot object from AppContext |

Behaviors:
- Clicking card image, name, or "Details" button → `setSelectedParrot()` (opens modal)
- Add to cart button (hidden when RESERVED/SOLD)
- WhatsApp inquiry CTA
- Rarity badges: EXCEPTIONAL (gold + Sparkles), RARE (violet), COMMON (outlined)
- Status badges: AVAILABLE (emerald), RESERVED (amber), SOLD (red)

### `HeroBackground` (`src/components/features/HeroBackground.tsx`)
Full-screen hero slideshow with cinematic parrot images. Auto-advances every 5s.

### `ProductCarousel` (`src/components/features/ProductCarousel.tsx`)
Horizontal scroll carousel for featured/related parrots. Accepts a `parrots` array.

---

## Common Components

### `AddToCartButton` (`src/components/common/AddToCartButton.tsx`)
Standalone add-to-cart button for detail pages.

| Prop | Type | Notes |
|---|---|---|
| `item` | `CartItem` | `{ id, name, slug, species, price, imageUrl }` |
| `status` | `string` | Parrot status — disables when not AVAILABLE |

### `CartDrawer` (`src/components/common/CartDrawer.tsx`)
Sliding inquiry cart panel (right side). Three-step flow: cart review → inquiry form → success.

| Prop | Type |
|---|---|
| `isOpen` | `boolean` |
| `onClose` | `() => void` |

### `ProductDetailModal` (`src/components/common/ProductDetailModal.tsx`)
Full-screen modal showing parrot detail when `selectedParrot` is set in AppContext.

### `NewsletterForm` (`src/components/common/NewsletterForm.tsx`)
Email subscription form. Uses `useActionState` with `subscribeToNewsletter` server action. Renders in the footer.

### `WhatsAppButton` (`src/components/common/WhatsAppButton.tsx`)
Floating chat CTA. Appears after a 2.5s delay. Dismissable.

| Prop | Type | Default |
|---|---|---|
| `phone` | `string?` | `NEXT_PUBLIC_WHATSAPP_NUMBER` env var |
| `customText` | `string?` | Language-aware default message |

### `Honeypot` (`src/components/common/Honeypot.tsx`)
Hidden form fields for spam detection. Include in contact/newsletter forms.

---

## Styling Conventions

All components must follow these rules:

1. **Borders**: `border border-black/[0.06] dark:border-white/[0.08]` on cards
2. **Glass surface**: add `glass` utility class for backdrop-blur panels
3. **Focus rings**: `focus:ring-2 focus:ring-primary/20 focus:border-primary` on inputs
4. **Transitions**: `transition-all duration-200` or `transition-colors` on interactive elements
5. **Hover lift**: `hover:-translate-y-1.5 hover:shadow-xl` on cards
6. **Scale feedback**: `hover:scale-[1.01] active:scale-[0.99]` on primary buttons
7. **Typography headings**: `font-heading` class on all `h1`, `h2`, section titles
8. **Accessibility**: all icon-only buttons need `aria-label`; all images need meaningful `alt`
