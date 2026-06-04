# Alunyte Onboarding Agent

Local-first MVP for an AI enterprise developer onboarding agent. The app indexes a public GitHub repository, stores useful files and chunks in SQLite, retrieves relevant context for questions, and answers with structured responses and file references.

See the root [README.md](../../README.md) for the project submission rubric and overview.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma + SQLite (better-sqlite3 adapter)
- OpenAI SDK behind a small AI service abstraction

## Setup

From the monorepo root:

```bash
npm install
cp apps/web/.env.example apps/web/.env
npm run prisma:generate -w @alunytee/web
npm run db:push -w @alunytee/web
npm run dev
```

Or from this directory:

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
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_STT_MODEL=whisper-1
GITHUB_TOKEN=
DATABASE_URL="file:./dev.db"
```

- `OPENAI_API_KEY` is optional. Without it, chat returns a retrieval-based fallback with source excerpts (`usedModel: local-retrieval-fallback`).
- `OPENAI_MODEL`, `OPENAI_TTS_MODEL`, and `OPENAI_STT_MODEL` override default OpenAI models.
- `GITHUB_TOKEN` is optional for public repos, but recommended to avoid GitHub rate limits.
- `DATABASE_URL` defaults to a local SQLite file. All indexed repo data stays on your machine.

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

## Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard, repo connection form, and new chat intake |
| `/c/[sessionId]` | Session-based Q&A with structured answers, citations, depth switch, voice I/O |
| `/repos/[repoId]` | Indexed repo overview |
| `/repos/[repoId]/brief` | Auto-generated onboarding brief |
| `/repos/[repoId]/tour` | Guided repo tour |
| `/repos/[repoId]/explore` | Concept map and insights |
| `/local-agent` | Documentation for the fixture CLI agent |
| `/progress` | Placeholder for onboarding progress (not yet implemented) |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/repos` | List indexed repositories |
| `POST` | `/api/repos/ingest` | Ingest a public GitHub URL |
| `GET` | `/api/repos/[repoId]` | Repository metadata and counts |
| `GET` | `/api/repos/[repoId]/files` | Indexed files for a repo |
| `GET` | `/api/repos/[repoId]/brief` | Onboarding brief content |
| `GET` | `/api/repos/[repoId]/tour` | Repo tour steps |
| `GET` | `/api/sessions` | List chat sessions |
| `POST` | `/api/sessions` | Create a session (intake → repo + depth) |
| `GET` | `/api/sessions/[sessionId]` | Session with chat turns |
| `POST` | `/api/chat` | Ask a question (`sessionId` or `repositoryId` + `question`) |
| `POST` | `/api/stt` | Speech-to-text (Whisper); browser Web Speech API used first on client |
| `POST` | `/api/tts` | Text-to-speech (OpenAI audio); browser fallback on client |

## Features

### Structured answers

Assistant responses use a JSON schema rendered by `StructuredAnswer`:

- `summary` — concise answer
- `keyPoints` — bullet list
- `snippets` — code blocks with file paths and line numbers
- `steps` — numbered procedure when applicable

Answers are persisted on `ChatTurn.structured` and converted to markdown/TTS as needed.

### Depth levels

| Level | Audience |
|-------|----------|
| `plain` | Non-technical; minimal jargon |
| `product` | PM; features and flows |
| `developer` | Working engineer; implementation detail |
| `deep` | Senior engineer; architecture and trade-offs |

Intake maps role/experience to a default depth; users can switch depth per session.

### Citations

Retrieved chunks produce `references[]` with `filePath`, `startLine`, `endLine`, and `score`. The UI links citations to an inline code viewer and source panel.

### Voice I/O

- **STT:** `useSpeechToText` tries the browser Web Speech API, then falls back to recording + `/api/stt` (Whisper).
- **TTS:** `useTextToSpeech` uses OpenAI TTS when configured, otherwise `speechSynthesis`. Listen button on assistant messages.

## Known Limitations

- Public GitHub repos only.
- Ingestion runs inside the request lifecycle, so very large repos may time out.
- Retrieval is keyword-based, not embeddings.
- Chat is non-streaming.
- Depth levels affect prompt tone only when `OPENAI_API_KEY` is set; retrieval is unchanged.
- Onboarding path generation, quizzes, and progress UI are modeled in Prisma but not implemented in this slice.

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

## Evaluation

Manual tests against `packages/mcp-ts-repo-builder` are documented in [docs/evaluation.md](../../docs/evaluation.md).
