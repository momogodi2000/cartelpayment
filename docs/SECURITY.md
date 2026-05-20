# Security

Implemented controls:

- bcrypt password hashing with 12 rounds.
- JWT sessions stored in HttpOnly cookies.
- Required secret configuration outside test mode.
- Protected admin dashboard proxy.
- Zod validation for forms and catalog/admin inputs.
- Honeypot fields for contact forms.
- Proxy rate limiting for sensitive routes.
- Security headers including HSTS, frame denial, content type protection, referrer policy, permissions policy, and CSP.
- Authenticated image uploads with MIME/type limits before storage handoff.
- Prisma queries instead of ad hoc SQL.
- Admin audit logs for important actions.

Production notes:

- Use a 32+ character secret for `JWT_SECRET`, `AUTH_SECRET`, or `SESSION_SECRET`.
- Keep SMTP and database credentials server-side only.
- Keep `UPLOADTHING_TOKEN` server-side only. Never expose it through client components.
- Replace in-memory rate limiting with Redis or managed edge rate limiting for multi-instance production.
