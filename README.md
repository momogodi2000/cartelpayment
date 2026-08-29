# PawElite

Premium Next.js frontend platform for a professional European dog & puppy breeder vitrine. 
The application provides a static catalog and content showcase without a backend, designed to route all inquiries and leads to WhatsApp.

## Features

- **Next.js App Router**: Fast, optimized server-rendered and static pages.
- **Frontend Only**: No database, Prisma, or complex backend dependencies. 
- **Static Data Management**: Content is managed via TypeScript static data files (`src/data/*.ts`), allowing simple content updates without a CMS.
- **WhatsApp Integration**: All user interactions (inquiries about dogs, contact forms) are routed dynamically to a WhatsApp number with pre-filled context.
- **Bilingual Interface**: Support for French (FR) and English (EN) using React Context and centralized dictionaries.
- **Modern UI**: Styled with Tailwind CSS, Framer Motion animations, and Radix UI primitives.
- **SEO Optimized**: Dynamic metadata, structured JSON-LD for dogs, and optimized standard `robots.txt` and `sitemap.xml`.

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
- **`src/data/`**: Static datasets for breeds, dogs, FAQ, site configuration, and testimonials. All demo data is marked clearly.
- **`src/context/`**: Global state management (`AppContext.tsx`) for theme and language.
- **`src/lib/`**: Utilities like `translations.ts` and `serverTranslations.ts`.

## Deployment

The application is highly optimized for deployment to edge networks (Vercel, Cloudflare Pages, Netlify) as it is primarily a static exportable frontend site.

```bash
# Build the production bundle
npm run build

# Start the production server locally
npm run start
```
