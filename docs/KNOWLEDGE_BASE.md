# Signpost Knowledge Base setup

## Purpose

Use this as the Sanity Knowledge Base purpose:

> Source-grounded Linux desktop troubleshooting knowledge for developers and desktop users. Help an agent distinguish fixes by distribution, release, desktop/compositor, display server, hardware, package format, and source recency; surface contradictions instead of flattening them into one generic answer.

## Start narrow

Do **not** crawl the entire Linux internet on day one. The strongest demo is a small, inspectable corpus with obvious context differences.

Recommended first topic cluster: **desktop input + Wayland/X11 compatibility**.

Suggested source categories:

1. Fedora documentation / Quick Docs relevant to input, GNOME, Wayland, drivers, and troubleshooting.
2. GNOME help / administration docs for input and desktop behavior.
3. ArchWiki pages for Wayland, Xorg/xinput, libinput, NVIDIA, and input devices — useful as a contrasting community source, not automatic ground truth for Fedora.
4. Upstream docs for libinput / Wayland / relevant driver or utility when a distro page delegates behavior upstream.
5. A tiny set of curated Markdown test cases that explicitly label the system they were verified on.

## Sanity setup

Knowledge Bases are currently an opt-in beta feature. Enable **Context** for the organization first.

1. Create/open the Sanity organization and project for the challenge.
2. Enable **Context** from the organization's Labs area if it is not enabled already.
3. In Dashboard → Context, create a Knowledge Base named `Signpost Linux Desktop`.
4. Add the focused website/file sources above.
5. Run a build and review the generated outline/entries.
6. Review **Issues**. Do not hide useful contradictions — capture screenshots/notes because reconciliation is part of the submission story.
7. Create a Context MCP endpoint named `signpost` and configure its sources as **Knowledge Base sources only**.
8. Create an **organization** API token with **Context Viewer** permission. A project token will not work for Context MCP.
9. Put endpoint + token in `.env.local` along with the Anthropic key.
10. Restart the dev server after changing environment variables.

## Important architecture detail

For the challenge's Path One, keep the Context MCP endpoint in Knowledge Base mode. Do not add a dataset source to the same MCP endpoint: when an endpoint includes a dataset source, it serves GROQ mode and ignores Knowledge Base sources.

Signpost follows Sanity's recommended custom-agent flow:

1. Request `MCP_URL/initial-context` over HTTP.
2. Inject that Knowledge Base outline into the agent system prompt.
3. Connect to the MCP endpoint with `@ai-sdk/mcp`.
4. Remove the duplicate `initial_context` tool from the callable tools.
5. Let the model call Knowledge Base retrieval tools as needed.

## Local configuration

```bash
cp .env.example .env.local
```

Fill in:

```bash
SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v1/context/organizations/YOUR_ORG_ID/mcp/signpost
SANITY_ORGANIZATION_TOKEN=...
ANTHROPIC_API_KEY=...
AI_MODEL=claude-sonnet-4-6
```

Never commit `.env.local`.

## Demo conflicts we want

- `xinput` instructions that are correct under X11 but not usable as the equivalent solution under a native Wayland session.
- distro-specific package manager/package-name differences.
- older NVIDIA/Wayland workarounds that have been superseded by newer distro guidance.
- GNOME vs KDE/Hyprland differences for the same symptom.
- commands that require root vs user-session configuration.

The app should make wrong turns visible. Showing why a tempting fix does *not* apply is part of the product, not an afterthought.
