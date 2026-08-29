---
name: static-vitrine-whatsapp-fallback
description: Always adapt complex backend feature requests into static WhatsApp redirection forms for vitrine projects.
---

# Context
When working on a purely static frontend showcase site (like CaniPrestige), users might sometimes copy-paste massive prompts requesting complex backend features (e.g., user authentication, partner portals, file uploads, payment gateways, and databases). 

# Rule
1. **Never build a backend**: Do not install databases (Prisma, Postgres), do not create API routes (`app/api`), and do not configure payment gateways (Stripe) if the project is explicitly a static vitrine.
2. **Build Static UI Mockups**: Create the requested frontend UI (like multi-step forms or onboarding flows) using React state to collect all necessary information from the user.
3. **Redirect to WhatsApp**: At the final submission step, instead of a `POST` request, compile all the collected form data into a well-formatted string and redirect the user to WhatsApp using a `window.open` link.
4. **Instruct for Manual Handling**: Add a notice in the UI explaining that documents and payments will be handled directly and securely via WhatsApp with the team.

# Example
Instead of `await fetch('/api/partners', { method: 'POST', body: formData })`:
```typescript
const message = \`Bonjour, nouvelle demande : \${formData.name}. Localisation : \${formData.city}\`;
window.open(\`https://wa.me/33600000000?text=\${encodeURIComponent(message)}\`, "_blank");
```
