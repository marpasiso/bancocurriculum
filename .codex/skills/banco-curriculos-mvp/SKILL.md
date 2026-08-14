---
name: banco-curriculos-mvp
description: Use when implementing, reviewing, or extending the Banco de Curriculos MVP in this repository, especially tasks involving Next.js App Router, Prisma with MySQL/MariaDB, secure sessions, employer subscriptions, LGPD consent and requests, admin Pix payments, CandidateView, AuditLog, README/local testing, or keeping business rules out of page.tsx.
---

# Banco Curriculos MVP

## Core Workflow

1. Inspect the current code before changing behavior.
2. Keep business rules in `src/modules`, not directly in `page.tsx`.
3. Validate all user input on the server.
4. Keep public pages thin: forms and navigation only.
5. Add or update tests for changed business rules.
6. Update `README.md` when local setup or manual testing changes.

## Architecture Rules

- Put domain behavior in `src/modules/<domain>/service.ts`.
- Put server actions in `src/modules/<domain>/actions.ts`.
- Put validation schemas in `src/modules/<domain>/validators.ts`.
- Use Prisma through `src/lib/prisma.ts`.
- Do not return `passwordHash` from any query used by UI.
- Do not expose candidate references in search/listing views.
- Do not implement upload, candidate login, automatic payment, WhatsApp, or AI unless the user explicitly changes scope.

## Domain References

Load only the reference that matches the task:

- Auth, sessions, password hashing: read `references/auth.md`.
- Candidate, LGPD, and sensitive data: read `references/lgpd-candidates.md`.
- Employer subscriptions and CandidateView: read `references/subscriptions-access.md`.
- Admin, Pix, and audit logging: read `references/admin-audit.md`.
- Local setup, README, migrations, and seed: read `references/local-testing.md`.

## Acceptance Baseline

Before finishing implementation work, prefer running:

```bash
npm run build
npm run test
```

If the local npm wrapper is broken, run equivalent local binaries and report that clearly.
