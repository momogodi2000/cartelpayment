# Email Campaigns

The app includes a simple campaign system:

- Subscriber management
- Draft campaign creation
- Campaign sending to active subscribers
- Recipient delivery records
- SMTP abstraction through `src/lib/mail.ts`

Required SMTP variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`
- `SMTP_SECURE`

Future providers can be added behind the same `sendMail` interface.
