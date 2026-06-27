# BIGT DB Migration Safety & Drift Guard

## 1. Root Cause of 2026-06-27 500 Incident

**Missing column `updatedAt` in `UserAnswer` table.** The Prisma schema had:

```prisma
model UserAnswer {
  // ...
  updatedAt DateTime @updatedAt
}
```

This field was added during Phase 18B constructed response work, but the database was not migrated (`prisma db push` was not run). Any API endpoint using `include: { answer: true }` (which SELECT * from UserAnswer) threw a 500 because PostgreSQL rejected the query — the column did not exist.

**Affected endpoints:**
- `GET /api/test/session/[id]` — 500
- `GET /api/test/history` — 500
- `GET /api/test/history?limit=...` — 500

## 2. Manual SQL Hotfix (Already Applied)

```sql
ALTER TABLE "UserAnswer"
ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;
```

This was run directly against the Supabase PostgreSQL database. After this, `prisma db push` confirmed:

```
Your database is now in sync with your Prisma schema.
```

## 3. Prisma Migration Strategy

### Current state
- Project uses `prisma db push` (not Prisma Migrate) for schema sync.
- Baseline migration `0_init` created and marked as applied:

```bash
# Generate baseline migration from current schema
mkdir -p prisma/migrations/0_init
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql

# Mark as applied on production database
npx prisma migrate resolve --applied 0_init
```

### For future schema changes

Option A — Continue with `db push` (simple):
```bash
npx prisma db push
```

Option B — Use Prisma Migrate (more controlled):
```bash
npx prisma migrate dev --name <change_description>
npx prisma migrate deploy  # on Vercel build
```

If migrating from `db push` to Prisma Migrate:
1. Ensure `migrations/` directory exists with `0_init` baseline
2. Run `npx prisma migrate resolve --applied 0_init` on all environments
3. Future changes use `prisma migrate dev`

## 4. Deployment Checklist

Before deploying code with Prisma schema changes:

- [ ] Run `npx prisma db push` (or `npx prisma migrate dev`) against production DB
- [ ] Verify with `npx prisma db push` that "database is now in sync"
- [ ] Verify migration status: `npx prisma migrate status`
- [ ] Run `npx prisma generate` to update Prisma Client
- [ ] Test affected API endpoints in staging

## 5. DB Health Check Endpoint

Endpoint: `GET /api/admin/system/db-health` (admin-only)

Checks:
- Critical tables exist (User, TestSession, UserAnswer, etc.)
- Critical columns exist in UserAnswer (`id`, `updatedAt`, `responseStatus`, etc.)
- Constructed response columns exist (`finalScoreJson`, `autoScoreJson`, etc.)
- Runtime query passes (`SELECT 1`)

Response shape:
```ts
{
  success: true,
  data: {
    status: "ok" | "warning" | "critical",
    summary: { total: number, ok: number, missing: number, errors: number },
    failures: [{ name: string, status: string, message: string }],
    checks: [{ name: string, status: string, message: string }],
  }
}
```

## 6. Owner Alert for DB Drift

The Owner Control Center (`/api/admin/bigt-owner`) includes a DB health check in `generateOwnerAlerts()`. If `UserAnswer.updatedAt` is missing, a `critical` alert is shown on the BIGT Overview page with a link to `GET /api/admin/system/db-health`.

## 7. How to Verify Production

```bash
# Check migration status
npx prisma migrate status

# Check DB sync
npx prisma db push

# Hit DB health endpoint
curl -H "Cookie: <admin_session>" https://www.bahasacerdas.site/api/admin/system/db-health

# Test session endpoint
curl -H "Cookie: <session>" https://www.bahasacerdas.site/api/test/session/<id>

# Test history endpoint
curl -H "Cookie: <session>" https://www.bahasacerdas.site/api/test/history
```

## 8. Rollback Notes

If a deployed migration causes issues:
- `prisma db push` cannot be rolled back — use raw SQL to revert
- For Prisma Migrate: `prisma migrate diff` to generate down migration
- `ALTER TABLE DROP COLUMN` if field was added but should be removed
- The DB health endpoint will immediately detect missing columns and flag them in the Owner Control Center

## 9. Known Risks

- `prisma db push --accept-data-loss` can drop columns — never use in production
- `prisma db push` may recreate enums (causes DROP/CREATE) — test before applying
- If switching from `db push` to Prisma Migrate, ensure `migrations/` directory is version-controlled
- Supabase PostgreSQL does not support Prisma shadow databases — use a separate staging DB for migration testing
- The DB health check queries `information_schema.columns` which requires table read access — works with standard Supabase credentials
