# Database

The Prisma schema models the production surface:

- Admin users and audit logs
- Parrot catalog, parrot images, categories, rarity/status metadata
- Blog, gallery, FAQ, testimonials
- Contact messages, cart inquiries, inquiry items
- Newsletter subscribers, email campaigns, campaign recipients
- Site settings

Important indexes exist on slugs, status, rarity, featured, created dates, emails, campaign status, and settings keys.

Image files are stored outside Neon. The `ParrotImage` model stores URL and storage metadata (`provider`, `storageKey`, `fileHash`) so UploadThing-hosted files can be traced without storing binary blobs in PostgreSQL.

Seeder behavior:

- Reads default admin credentials from `.env`.
- Fails safely when required admin seed variables are missing.
- Upserts default admins as active superadmins with full `*` permissions.
- Seeds 30+ enriched parrot profiles and four images per bird.
- Uses `SEED_RESET=true` only for intentional content reset.
