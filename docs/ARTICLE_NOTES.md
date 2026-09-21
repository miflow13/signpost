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

The initial five-source corpus was then added: upstream libinput documentation, ArchWiki pages for XInput/libinput context, and X.Org background. Keeping this first corpus small is deliberate: the goal is to make Wayland/X11 applicability easy to inspect before expanding into broader distro-specific troubleshooting.

### First Knowledge Base snag: website crawl scope

The first build exposed an important practical constraint. Even though the libinput source was added using the specific `ignoring-devices.html` page URL, Sanity's website crawler expanded that source into **139 indexed documents**. Combined with the rest of the organization, that pushed usage to **177 / 150 indexed documents**, disabling the build on the current plan.

A second libinput API URL produced **0 documents** through the website crawler.

Rather than upgrade the plan or broaden the corpus accidentally, the v0.1 strategy changed:

- keep the small ArchWiki/X.Org pages as website sources,
- remove the 139-document libinput website crawl,
- save the exact two libinput pages as local HTML files,
- upload those exact HTML files as **File** sources so each page remains bounded instead of turning into a site crawl.

This is a useful design lesson for the article: "specific URL" does not necessarily mean "one indexed document" when the source type is a web crawler. Source type is part of retrieval design, not just ingestion plumbing.

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


### First bounded Knowledge Base build

After replacing the runaway website crawl with a bounded five-source setup, the first real Knowledge Base build was started.

The v0.1 corpus at build time is intentionally small:
- ArchWiki XInput
- ArchWiki libinput
- X.Org input-extension documentation
- exact libinput "ignoring devices" HTML uploaded as a file
- exact libinput device-configuration HTML uploaded as a file

This is the first build intended to test the actual Signpost thesis: whether the indexed source set preserves enough context to distinguish X11/XInput advice from Wayland/libinput guidance without drowning the agent in unrelated Linux documentation.


### First successful Knowledge Base build

The first bounded Knowledge Base build completed successfully and the generated entries populated cleanly.

This matters because the initial source strategy was deliberately small and inspectable. After the earlier 139-document crawl problem, the corpus was rebuilt around three narrow website sources plus two exact uploaded libinput HTML files. Sanity then generated a clean entry set from that corpus without the runaway crawl behavior.

At this point the project crossed an important milestone: Signpost now has a real, structured source layer that can be queried by the application rather than relying on placeholder retrieval logic.
