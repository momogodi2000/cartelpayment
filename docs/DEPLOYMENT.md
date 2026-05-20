# Deployment

Recommended deployment targets:

- Vercel for the Next.js application.
- Neon PostgreSQL for production database.
- UploadThing for production parrot image storage.
- SMTP provider such as Brevo, Mailgun, SendGrid, Resend SMTP, or a managed transactional email account.

Deployment checklist:

- Configure all `.env.example` variables in the hosting platform.
- Run `npm run db:generate` and `npm run db:push` during setup.
- Run `npm run db:seed` once after database provisioning.
- Verify `/api/health` and `/api/status`.
- Confirm admin login at `/admin/login`.
- Confirm WhatsApp number and SMTP sender.
- Confirm `UPLOADTHING_TOKEN` is configured before testing admin parrot uploads.

## Image Storage

Admin parrot images are uploaded through the protected `/api/upload` route. In production, the route sends files to UploadThing and stores only the returned URL and metadata in Neon. The local `public/uploads/parrots` fallback is for development environments where `UPLOADTHING_TOKEN` is not configured.
