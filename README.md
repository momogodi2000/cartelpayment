# pawelium

Premium Next.js vitrine for a European purebred **dog & cat** breeder — puppies and kittens.
A static catalogue and content showcase with no backend; every inquiry is routed to WhatsApp.
Deployed at **[pawelium.fyi](https://pawelium.fyi)**.

## Features

- **Next.js App Router**: server-rendered and statically optimized pages.
- **Frontend only**: no database, no CMS. Content lives in typed data files under `src/data/*.ts`.
- **Real client media**: catalogue photos are served from `public/images/chien` and `public/images/chats`; imagery is 100% first-party.
- **WhatsApp integration**: dog/cat inquiries open WhatsApp with pre-filled, contextual messages.
- **Bilingual**: French (default) and English via `next-intl` with `/` and `/en` routing.
- **Site-wide −35% launch promotion**: `DISCOUNT_RATE` in `src/data/dogs.ts`; every listing carries `originalPrice`.
- **UI**: Tailwind CSS v4 + Framer Motion.
- **SEO**: per-page metadata, hreflang alternates, JSON-LD (`Product`, `Organization`, `BreadcrumbList`, `FAQPage`), `robots.txt` and localized `sitemap.xml`.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables and adjust if needed
cp .env.example .env

# Start development server
npm run dev
```

Open `http://localhost:3000` to view the site.

## Architecture

- **`src/app/`**: Next.js App Router pages (Homepage, `/catalogue`, `/catalogue/[slug]`, `/faq`, `/contact`, `/a-propos`).
- **`src/components/`**: Reusable React components (UI elements, layout, sections).
- **`src/data/`**: Typed datasets — `dogs.ts`, `cats.ts`, `animals.ts` (unified), `breeds.ts`, `faq.ts`, `testimonials.ts`, `partnership.ts`, `site.ts`.
- **`src/i18n/` + `messages/`**: `next-intl` routing and the FR/EN message catalogues.
- **`src/context/`**: `AppContext.tsx` for theme state.

## Deployment

Optimized for edge deployment (Netlify / Vercel / Cloudflare Pages). Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER` and `NEXT_PUBLIC_CONTACT_EMAIL` in the host environment (see `.env.example`).

```bash
# Build the production bundle
npm run build

# Start the production server locally
npm run start
```
