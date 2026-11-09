---
name: fullstack-commerce
description: Standards and guidelines for the fullstack Pawelium 2.0 marketplace.
---

# Fullstack Commerce Architecture

1. **Fullstack Architecture**: Pawelium 2.0 is a complete e-commerce marketplace powered by Next.js App Router, Prisma ORM (SQLite for local/testing, Neon PostgreSQL for production), server actions, route handlers, and GeniusPay payment integration.
2. **Server-Side Authority**: All pricing calculations, reservation hold locks, payment settlements, and order state transitions are computed and enforced server-side.
3. **Database Integrity**: Prisma transactions with Serializable isolation guarantee single active reservations (`activeAnimalId`). No client-side or optimistic overrides for inventory.
4. **Security & Authentication**: Single SUPER_ADMIN role with hardened sessions (`AdminSession`), optional TOTP MFA, and constant-time token verification. Zero unauthenticated access to admin endpoints or customer private data.
5. **WhatsApp Channel**: WhatsApp serves as an auxiliary concierge channel for customer inquiries, not a substitute for checkout or backend logic.
