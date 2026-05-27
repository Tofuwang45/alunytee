# Alunytee

Monorepo for the Alunyte enterprise developer onboarding platform.

## Structure

| Path | Description |
|------|-------------|
| [`apps/web`](apps/web) | Next.js onboarding agent (repo ingestion, chat, SQLite via Prisma) |
| [`packages/mcp-ts-repo-builder`](packages/mcp-ts-repo-builder) | TypeScript fixture repo for testing codebase analysis agents |

## Quick start

```bash
npm install
cp apps/web/.env.example apps/web/.env
npm run prisma:generate -w @alunytee/web
npm run db:push -w @alunytee/web
npm run dev
```

Open http://localhost:3000.

See [apps/web/README.md](apps/web/README.md) for environment variables, API routes, and limitations.

## Fixture package

```bash
npm run build:fixture
```

See [packages/mcp-ts-repo-builder/README.md](packages/mcp-ts-repo-builder/README.md) for analysis scenarios and directory map.
