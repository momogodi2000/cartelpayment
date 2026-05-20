# DevOps

CI pipeline:

- `npm ci`
- Prisma client generation
- ESLint
- TypeScript typecheck
- Unit tests
- Coverage gate
- Next.js production build
- `npm audit --audit-level=high`
- Docker image build

Docker:

- `Dockerfile` supports production builds.
- `docker-compose.yml` supports local app plus PostgreSQL.
- `.dockerignore` should exclude local artifacts, caches, logs, and secrets.

Operational endpoints:

- `/api/health`
- `/api/status`
