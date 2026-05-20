# Admin Guide

Login at `/admin/login`. After authentication, admins can use:

- `/admin/dashboard`
- `/admin/dashboard/parrots`
- `/admin/dashboard/blog`
- `/admin/dashboard/gallery`
- `/admin/dashboard/newsletter`
- `/admin/dashboard/messages`
- `/admin/dashboard/settings`

Recommended workflow:

- Seed admin users with `npm run db:seed`.
- Add or edit bird profiles from the parrots area.
- Review contact messages and cart inquiries daily.
- Use newsletter campaigns for availability updates and care education.
- Review audit logs in settings after sensitive changes.
