# Testing

Commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
npm run build
```

Current coverage focuses on core deterministic modules:

- WhatsApp link generation
- Auth hashing and JWT verification
- Zod validation
- Enriched parrot validation
- Checkout validation and WhatsApp inquiry message generation

Coverage thresholds:

- Branches: 85+
- Functions: 90+
- Lines: 90+
- Statements: 90+
