# Database

The Prisma schema models the production surface:

- Admin users and audit logs
- Parrot catalog, parrot images, categories, rarity/status metadata
- Blog, gallery, FAQ, testimonials
- Contact messages, cart inquiries, inquiry items
- Newsletter subscribers, email campaigns, campaign recipients
- Site settings

Important indexes exist on slugs, status, rarity, featured, created dates, emails, campaign status, and settings keys.

Seeder behavior:

- Reads default admin credentials from `.env`.
- Fails safely when required admin seed variables are missing.
- Creates admins only when they do not already exist.
- Seeds 30+ enriched parrot profiles and four images per bird.
- Uses `SEED_RESET=true` only for intentional content reset.
