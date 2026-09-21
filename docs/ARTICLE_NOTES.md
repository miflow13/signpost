# Signpost — article build log

This file is the running source of truth for the DEV article. Update it during development instead of trying to reconstruct the project story at submission time.

## Project snapshot

**Name:** Signpost  
**Tagline:** Linux troubleshooting, pointed in the right direction.  
**Challenge:** DEV × Sanity Challenge 2026 — Path One  
**Core thesis:** A Linux fix can be technically correct and still be wrong for your machine. Signpost treats context as part of correctness.

## September 21, 2026 — project start

### The problem

Linux troubleshooting answers routinely collapse incompatible contexts together. Search results can mix Fedora and Ubuntu, current and obsolete releases, GNOME and KDE, X11 and Wayland, distro packages and upstream packages, and different GPU or driver assumptions.

The first idea was called **WrongFix**, because the product would identify fixes that look plausible but do not apply. We renamed it **Signpost** because the product is less about declaring answers wrong and more about orienting the user toward the correct path for their actual system.

That rename gave us the product vocabulary too:

- **Right direction** — the source-grounded path that fits the supplied system profile.
- **Why it fits** — the contextual reasoning: distro, release, desktop, session, hardware.
- **Wrong turns** — plausible advice from the source material that does not apply to this system.
- **Confidence** — how complete the Knowledge Base coverage is for the answer.
- **Sources** — the material used to ground the response.

### Why Sanity Context is not decorative

Signpost needs retrieval that can preserve source context and expose overlapping or contradictory documentation. A Sanity Knowledge Base is built ahead of the agent call from trusted websites/files, and Context MCP gives the application read-only access to that indexed material.

The application fetches `/initial-context` first and injects the Knowledge Base outline into the system prompt. It then connects to the same Context MCP endpoint, exposes its retrieval tools to the model, and removes the redundant `initial_context` tool from the callable set.

The MCP endpoint is intentionally configured with **Knowledge Base sources only**. Mixing a dataset source into the same endpoint would switch retrieval mode and cause the Knowledge Base sources to be ignored.

### First implementation milestone

Repository: `miflow13/signpost`  
Feature branch: `feat/sanity-knowledge-base`

Initial application stack:

- Next.js + React
- Vercel AI SDK
- Anthropic provider
- `@ai-sdk/mcp`
- Sanity Context MCP
- Sanity Knowledge Base

The first implementation includes:

- editable Linux system profile,
- troubleshooting question UI,
- server-only Context MCP credentials,
- `/initial-context` prefetch,
- MCP tool discovery,
- system prompt that treats system context as part of correctness,
- structured Right direction / Wrong turns responses,
- input normalization and length limits,
- MCP client cleanup after each request,
- challenge planning and demo documentation,
- Next.js 16 linting configured with ESLint flat config instead of the deprecated `next lint` command.

### Sanity project milestone

The Sanity project **Signpost Linux Desktop** was created and the organization-level **Context / Knowledge Bases** feature was enabled.

This was an important architectural checkpoint: Signpost does **not** need a traditional Sanity Studio or CMS schema for the v0.1 demo. The product is using Sanity as the retrieval and context layer, so the next work happens inside the organization-level Context app.

The first Knowledge Base is also named **Signpost Linux Desktop** and is intentionally being kept narrow before any broad Linux documentation ingestion.

### First test case

Start intentionally narrow: **Wayland/X11 input-device troubleshooting**.

Baseline profile:

```text
Fedora 44
GNOME
Wayland
laptop + external USB keyboard
```

Question:

> How do I disable my laptop's internal keyboard without disabling my USB keyboard?

The expected demo is not merely that Signpost produces an answer. It should be able to surface an `xinput`-style X11 solution as a **Wrong turn** when the user is on native Wayland, then change the guidance when the session context is changed to X11.

### Security / implementation decisions worth mentioning

- The Sanity token is an **organization-level** API token with **Context Viewer** permission, not a project read token.
- The token never reaches client-side code.
- The application does not silently translate commands across distributions or display servers.
- Destructive or boot-level commands require a warning and a safer verification step first.
- Unsupported claims should be marked as incomplete rather than filled in from model memory.

## Screenshots / assets to collect later

- Signpost landing screen.
- Fedora 44 + GNOME + Wayland profile filled in.
- First successful Right direction response.
- A visible Wrong turn for incompatible X11 advice.
- Same question after changing Wayland → X11.
- Sanity project-created screen.
- Sanity Knowledge Base outline.
- Sanity Issues/conflict-resolution view, if a useful real conflict appears.
- The Context MCP configuration showing Knowledge Base-only sources (with secrets hidden).

## Article structure candidate

1. The Linux answer that was "right" and still broke the problem.
2. Why context is part of correctness.
3. Why I chose Sanity Knowledge Bases instead of a generic RAG dump.
4. Building the system-profile layer.
5. Wiring `/initial-context` + Context MCP into the agent.
6. Making Wrong turns first-class output.
7. The Wayland/X11 test that proves the idea.
8. What conflict resolution taught me.
9. What I would build next.

## Things we still need to record

- Exact Knowledge Base sources used in v0.1.
- Any build issues or source conflicts Sanity reports.
- The first successful end-to-end query and its response time.
- Benchmark questions and pass/fail notes.
- Deployment URL.
- Sanity project ID/public inspection information required by the challenge submission.
- Final demo GIF/video.
