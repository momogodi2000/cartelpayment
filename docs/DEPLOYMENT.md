# Deployment

Recommended deployment targets:

- Vercel for the Next.js application.
- Neon PostgreSQL for production database.
- SMTP provider such as Brevo, Mailgun, SendGrid, Resend SMTP, or a managed transactional email account.

Deployment checklist:

- Configure all `.env.example` variables in the hosting platform.
- Run `npm run db:generate` and `npm run db:push` during setup.
- Run `npm run db:seed` once after database provisioning.
- Verify `/api/health` and `/api/status`.
- Confirm admin login at `/admin/login`.
- Confirm WhatsApp number and SMTP sender.
