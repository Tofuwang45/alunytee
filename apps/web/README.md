# Alunyte Onboarding Agent

Local-first MVP for an AI enterprise developer onboarding agent. The app indexes a public GitHub repository, stores useful files and chunks in SQLite, retrieves relevant context for questions, and answers with file references.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- SQLite
- OpenAI SDK behind a small AI service abstraction

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run dev
```

Open http://localhost:3000.

## Environment Variables

```env
OPENAI_API_KEY=
GITHUB_TOKEN=
DATABASE_URL="file:./dev.db"
```

- `OPENAI_API_KEY` is optional for ingestion. Without it, chat returns a retrieval-based fallback with source excerpts.
- `GITHUB_TOKEN` is optional for public repos, but recommended to avoid GitHub rate limits.
- `DATABASE_URL` defaults to a local SQLite file.

## How Repo Ingestion Works

1. The user submits a public GitHub URL.
2. The app fetches repository metadata and the recursive GitHub file tree.
3. Dependency, generated, binary, oversized, lock, and env-like files are ignored.
4. Text/code files are fetched from GitHub raw content.
5. Files with likely secrets are skipped before storage.
6. File contents are stored in `RepoFile`.
7. Contents are split into overlapping line chunks and stored in `RepoChunk`.
8. Chat performs keyword scoring over chunks and sends the best context to the AI service.

Included file types include Markdown, text, common application languages, JSON/YAML/TOML/SQL, and `Dockerfile`.

## MVP Routes

- `/` dashboard and repo connection form
- `/repos/[repoId]` indexed repo overview
- `/repos/[repoId]/chat` repo Q&A with file references and retrieved context
- `/progress` placeholder for the next onboarding/progress slice

## API Routes

- `GET /api/repos`
- `POST /api/repos/ingest`
- `GET /api/repos/[repoId]`
- `POST /api/chat`

## Known Limitations

- Public GitHub repos only.
- Ingestion runs inside the request lifecycle, so very large repos may time out.
- Retrieval is keyword-based, not embeddings.
- Chat is non-streaming.
- Onboarding path generation, quizzes, and progress UI are modeled in Prisma but not implemented in this first slice.

## Future Improvements

- Background ingestion jobs
- Embeddings with Postgres and pgvector
- Private repo OAuth
- GitLab support
- Onboarding path generation
- Active quizzes and grading
- Team progress dashboards
- Slack, Jira, Linear, and company docs ingestion
- SSO, RBAC, audit logs, and multi-tenant workspaces
