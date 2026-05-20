# Architecture

AraHaven uses the Next.js App Router with server components for data-heavy public pages and client components for interactive surfaces such as filters, theme/language state, and the cart drawer.

Core layers:

- `src/app`: routes, layouts, API health/status endpoints, and Server Actions.
- `src/components`: reusable public and admin UI components.
- `src/context`: browser state for language, theme, and local cart persistence.
- `src/lib`: database client, auth helpers, schemas, mail, checkout, WhatsApp utilities, and translations.
- `prisma`: relational schema and production-quality seed data.

The preferred data flow is Prisma in server components or Server Actions, Zod validation at boundaries, typed utilities for shared logic, and minimal client-side state.
