# AraHaven Exotic Aviary

Premium Next.js platform for a professional exotic parrot breeder. The app combines a public catalog, WhatsApp-first inquiry cart, admin CMS, newsletter campaigns, PWA support, PostgreSQL data storage, Docker, CI, and health monitoring.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript strict mode
- Tailwind CSS 4 design tokens and Framer Motion
- Prisma ORM with PostgreSQL or Neon
- bcryptjs password hashing, jose JWT sessions, HttpOnly cookies
- Nodemailer SMTP abstraction
- Vitest coverage, Playwright script, GitHub Actions CI
- Docker and docker-compose

## Install

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment

Required production variables:

- `DATABASE_URL`
- `JWT_SECRET` or `AUTH_SECRET` or `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `UPLOADTHING_TOKEN` for production parrot image uploads
- `DEFAULT_ADMIN_1_EMAIL`, `DEFAULT_ADMIN_1_PASSWORD`, `DEFAULT_ADMIN_1_NAME`
- `DEFAULT_ADMIN_2_EMAIL`, `DEFAULT_ADMIN_2_PASSWORD`, `DEFAULT_ADMIN_2_NAME`

Optional SMTP variables:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`

Never commit real secrets. The seeder now fails safely if default admin credentials are missing.

## Database

Schema lives in [prisma/schema.prisma](/d:/IT%20Project/elvis/prisma/schema.prisma). It includes admins, parrots, parrot images, categories, blog posts, gallery, FAQs, testimonials, contact messages, cart inquiries, newsletter subscribers, email campaigns, audit logs, and site settings.

Parrot image files are not stored as binary blobs in Neon. In production, `/api/upload` sends authenticated admin uploads to UploadThing and stores the returned URL plus provider metadata (`provider`, `storageKey`, `fileHash`) in the `ParrotImage` table. If `UPLOADTHING_TOKEN` is absent, the route falls back to local `public/uploads/parrots` storage for development only.

Useful commands:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Set `SEED_RESET=true` only when you intentionally want to clear seed-owned content before re-seeding. Admin users are created only when absent; existing admin passwords are not overwritten.

## Quality

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
```

Coverage thresholds are configured in [vitest.config.ts](/d:/IT%20Project/elvis/vitest.config.ts): branches 85%, functions 90%, lines 90%, statements 90% for tested modules.

## Docker

```bash
npm run docker:build
npm run docker:run
docker-compose up --build
```

The Dockerfile performs a Prisma client generation and Next.js production build, then runs the app with `next start`.

## CI/CD

GitHub Actions in [.github/workflows/ci.yml](/d:/IT%20Project/elvis/.github/workflows/ci.yml) runs install, Prisma generation, lint, typecheck, tests, coverage, build, security audit, and Docker build. The workflow now fails on real quality failures instead of continuing past them.

## Monitoring

- `GET /api/health`: application and database health
- `GET /api/status`: uptime, memory, environment, database latency, timestamp

Future-ready hooks are documented for Sentry, Logtail, Grafana, Prometheus, and Vercel Analytics.

## Admin

Admin login is available at `/admin/login`. Protected dashboard routes live under `/admin/dashboard`, including parrots, blog, gallery, newsletter, inquiries/messages, and settings.
