# ↗ Signpost

**Linux troubleshooting, pointed in the right direction.**

Signpost is a source-grounded Linux troubleshooting agent built for the **DEV × Sanity Challenge 2026 — Path One**. It combines a user's actual system profile with a Sanity Context Knowledge Base so the agent can distinguish advice by distro, release, desktop/compositor, display server, hardware, and source recency.

The important feature is not just the direction Signpost recommends. It also makes **wrong turns** visible: plausible fixes that do not apply to your system, with an explanation of the context mismatch.

## Why this exists

Linux support content is full of context drift. A Stack Overflow answer can be technically correct for Ubuntu + X11 in 2021 and actively unhelpful for Fedora + GNOME + Wayland in 2026.

Signpost treats **context as part of correctness**.

## Architecture

```text
System profile + question
          │
          ▼
      Next.js UI
          │
          ▼
   /api/ask (server)
          │
     Vercel AI SDK
          │
          ├──────────────► model
          │
          ▼
 Sanity Context MCP
          │
          ▼
 Sanity Knowledge Base
          │
     source-linked entries
          │
  Fedora / GNOME / ArchWiki /
  upstream docs / curated tests
```

The Context MCP endpoint should be backed by the Knowledge Base only. The server fetches Sanity's initial context, exposes the KB tools to the model, and requires source-grounded answers.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment

```bash
SANITY_CONTEXT_MCP_URL=...
SANITY_ORGANIZATION_TOKEN=...
ANTHROPIC_API_KEY=...
AI_MODEL=claude-sonnet-5
```

The Sanity organization token needs **Context Viewer** permission and must remain server-side.

## Today

Read these in order:

1. `docs/KNOWLEDGE_BASE.md`
2. `docs/CHALLENGE_PLAN.md`
3. `docs/DEMO_SCRIPT.md`

Then create the Sanity project + first focused Knowledge Base. Do not broaden the corpus until one conflict-heavy demo question works end to end.

## Challenge submission note

The DEV challenge requires the submission to include the Sanity project ID or a public dataset URL so the Sanity team can inspect how structured content was used. Add that before publishing.
# signpost
