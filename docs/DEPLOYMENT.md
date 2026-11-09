# Pawelium 2.0 — Production Deployment & Operations Guide

This guide details the complete deployment process, infrastructure configuration, security requirements, and operational procedures for **Pawelium 2.0** on Netlify and Neon PostgreSQL.

---

## 1. Architecture & Infrastructure Overview

Pawelium 2.0 is built on **Next.js 16 (App Router)** and deployed to **Netlify** with serverless runtime support via `@netlify/plugin-nextjs`. Data persistence is managed with **Prisma ORM** supporting **Neon Serverless PostgreSQL** with connection pooling.

```
                  +-----------------------------------+
                  |           pawelium.fyi            |
                  |     (Cloudflare DNS / Netlify)    |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
     Public App Router                               SUPER_ADMIN
  /en & /fr prefixed routes                         /admin dashboard
  (Localized catalog, cart,                        (Opaque hashed session,
   tracking, support)                               TOTP MFA, audit logs)
            |                                               |
            +-----------------------+-----------------------+
                                    |
                           Next.js Server Actions
                            & REST API Handlers
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
+------+------+              +------+------+              +------+------+
| Neon Cloud  |              |  GeniusPay  |              | Resend REST |
| PostgreSQL  |              | Hosted Card |              | Email Outbox|
| (-pooler)   |              |  Checkout   |              | (Background)|
+-------------+              +-------------+              +-------------+
```

---

## 2. Neon PostgreSQL Configuration

Neon provides serverless PostgreSQL with built-in connection pooling via PgBouncer.

### 2.1 Connection String Setup

Prisma requires two connection strings when using Neon:
1. `DATABASE_URL`: Connection pooled URL (`-pooler.eastus2.azure.neon.tech` or `-pooler.eu-central-1.aws.neon.tech`) with `sslmode=require`. Used by Prisma Client during web requests.
2. `DIRECT_DATABASE_URL`: Direct, unpooled connection to Neon compute. Required for Prisma migrations (`migrate:deploy`), table locks, and DDL operations.

Example `.env.production`:
```env
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-fragrant-pond-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-fragrant-pond.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 2.2 Running Migrations on Neon

To apply the production migration to Neon:

```bash
# 1. Ensure DATABASE_PROVIDER is set to postgresql
export DATABASE_PROVIDER=postgresql
export DATABASE_URL="<your-neon-pooler-url>"
export DIRECT_DATABASE_URL="<your-neon-direct-url>"

# 2. Deploy migrations
npm run db:migrate:deploy

# 3. Seed initial breeds, available catalog animals, and SUPER_ADMIN
npm run db:seed
```

> **Note on Migration Isolation**: The codebase maintains two distinct schemas generated from `prisma/schema.base.prisma`:
> - SQLite schema: `prisma/sqlite/schema.prisma`
> - PostgreSQL schema: `prisma/postgres/schema.prisma`
> The deploy command automatically picks the PostgreSQL schema when `DATABASE_PROVIDER=postgresql`.

---

## 3. Netlify Deployment Setup

### 3.1 Netlify Configuration (`netlify.toml`)

The repository includes `netlify.toml` configured with the official OpenNext adapter:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20.18.0"
  DATABASE_PROVIDER = "postgresql"
```

### 3.2 Scheduled Background Functions (Crons)

Four automated maintenance tasks are scheduled in `netlify/functions/*.mts`:

| Function | Schedule | Target Endpoint | Purpose |
|---|---|---|---|
| `expire-reservations.mts` | `*/5 * * * *` (Every 5 min) | `/api/internal/cron/expire-reservations` | Releases expired 15-minute holds, reconciles late payments |
| `email-outbox.mts` | `* * * * *` (Every minute) | `/api/internal/cron/email-outbox` | Retries failed transactional emails with exponential backoff |
| `cleanup-sessions.mts` | `0 3 * * *` (Daily at 03:00 UTC) | `/api/internal/cron/cleanup-sessions` | Purges expired admin sessions, OTP verifications, and rate buckets |

Each Netlify scheduled function sends a POST request with:
```http
Authorization: Bearer <CRON_SECRET>
```

#### Manual Fallback Trigger
If Netlify scheduled functions are not enabled on your plan, triggers can be scheduled via an external cron service (e.g. Cloudflare Worker, GitHub Actions, or cron-job.org):
```bash
curl -X POST https://pawelium.fyi/api/internal/cron/expire-reservations \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 4. GeniusPay Webhook Configuration

### 4.1 Webhook Endpoint
Configure the webhook in the GeniusPay Merchant Portal:
- **Webhook URL**: `https://pawelium.fyi/api/payments/geniuspay/webhook`
- **Events to subscribe**:
  - `payment.initiated`
  - `payment.success`
  - `payment.failed`
  - `payment.cancelled`
  - `payment.expired`
  - `payment.refunded`

### 4.2 Webhook Security & Verification
The handler at `/api/payments/geniuspay/webhook` enforces:
1. **Timestamp Freshness**: Rejects requests where `X-Webhook-Timestamp` differs from server time by more than 300 seconds (replay protection).
2. **HMAC-SHA256 Signature**: Computes `crypto.createHmac("sha256", GENIUSPAY_WEBHOOK_SECRET).update(timestamp + "." + rawBody).digest("hex")` and validates against `X-Webhook-Signature` using `crypto.timingSafeEqual`.
3. **Idempotency**: All events are recorded in `PaymentEvent` and deduplicated by delivery ID. Duplicate webhooks receive an immediate `200 OK` without double-processing.

---

## 5. Production Environment Variables Checklist

Set these environment variables in the Netlify Dashboard (**Site configuration > Environment variables**):

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://pawelium.fyi
ENCRYPTION_KEY=64_HEX_CHARACTERS_HERE_32_BYTES_FOR_AES_256_GCM
CRON_SECRET=32_HEX_CHARACTERS_FOR_INTERNAL_CRON_AUTH

# Database (Neon)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
DIRECT_DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep.eu-central-1.aws.neon.tech/neondb?sslmode=require

# GeniusPay Production Credentials
GENIUSPAY_ENVIRONMENT=production
GENIUSPAY_API_KEY=pk_live_...
GENIUSPAY_API_SECRET=sk_live_...
GENIUSPAY_WEBHOOK_SECRET=whsec_...
GENIUSPAY_BASE_URL=https://geniuspay.ci/api/v1/merchant
GENIUSPAY_AMOUNT_UNIT=major

# Transactional Emails (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=contact@pawelium.fyi

# Media Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=pawelium
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Business Logistics
ADMIN_BOOTSTRAP_EMAIL=admin@pawelium.fyi
ADMIN_BOOTSTRAP_PASSWORD=STRONG_INITIAL_PASSWORD_HERE
WHATSAPP_PHONE=+33600000000
```

> **Security Guard**: `src/lib/env.ts` actively rejects any non-production deployment that attempts to use live keys, and rejects production deployments that lack valid encryption keys.

---

## 6. Super Admin Bootstrap & Access

To create the initial SUPER_ADMIN account in production:

```bash
# In your local shell connected to production DB, or via Netlify CLI:
npx tsx scripts/admin-bootstrap.ts --email admin@pawelium.fyi --password "YourStrongPassword123!"
```

### Accessing the Dashboard
- Navigate to `https://pawelium.fyi/admin/login`
- Log in with email and password.
- In Settings, enable **TOTP Two-Factor Authentication (MFA)** using Google Authenticator or 1Password.
- Store emergency recovery codes in a secure vault.

---

## 7. Backup Policies & Disaster Recovery

1. **Neon Automated Point-in-Time Recovery (PITR)**:
   - Neon maintains continuous Write-Ahead Log (WAL) archiving.
   - You can restore the database to any state within the retention window (up to 30 days on Neon Pro) via the Neon Console.
2. **Weekly Logical Dump**:
   ```bash
   pg_dump "$DIRECT_DATABASE_URL" --format=c --file=backup_$(date +%Y%m%d).dump
   ```
3. **Cloudinary Assets**:
   - All animal images and veterinary certificates are stored in Cloudinary with automated versioning.

---

## 8. Rollout Verification Checklist

After deploying to Netlify and linking Neon:

- [ ] Check health endpoint: `GET https://pawelium.fyi/api/health` returns `200 OK` and `{ status: "healthy", database: "connected" }`.
- [ ] Verify redirects: `GET https://pawelium.fyi/catalogue/whippet-sky` returns `301 Moved Permanently` to `/fr/animaux/whippet-sky`.
- [ ] Verify localized routes:
  - English catalog: `https://pawelium.fyi/en/animals`
  - French catalog: `https://pawelium.fyi/fr/animaux`
- [ ] Test hold reservation: Add an animal to checkout, verify the 15-minute countdown displays.
- [ ] Test admin authentication: Verify `/admin` redirects unauthenticated users to `/admin/login`.
- [ ] Check cron auth: Ensure `/api/internal/cron/expire-reservations` returns `401 Unauthorized` without the Bearer token.
