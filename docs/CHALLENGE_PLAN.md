# DEV × Sanity Challenge plan — Signpost

## Track

**Path One: Ship an Agent That Queries Real Content**

Signpost is strongest here because its value comes from reconciling overlapping documentation and preserving source context — not from a generic chat UI.

## One-line pitch

**Signpost is a context-aware Linux troubleshooting agent that points users toward fixes that actually match their system.**

## Problem

Linux troubleshooting search results frequently mix:
- different distributions and releases,
- X11 and Wayland,
- GNOME, KDE and compositors such as Hyprland,
- distro packages and upstream packages,
- old workarounds and current guidance.

A command can therefore be "correct" and still be wrong for the user's machine.

## Core interaction

1. User enters a system profile.
2. User asks a troubleshooting question.
3. Agent reads the Sanity Knowledge Base through Context MCP.
4. Answer is separated into:
   - right direction,
   - why it applies,
   - wrong turns,
   - confidence,
   - sources.

## MVP

- [x] Product thesis and brand
- [x] Web UI scaffold
- [x] System-profile capture
- [x] Sanity Context MCP client wiring
- [x] Source-grounding system prompt
- [x] Running article/build log
- [ ] Create Sanity project
- [ ] Enable Context + Knowledge Bases
- [x] Add 4–8 focused sources
- [ ] Build Knowledge Base
- [ ] Resolve/document at least one real conflict
- [ ] Connect live endpoint
- [ ] Validate 8–12 benchmark questions
- [ ] Deploy on Vercel
- [ ] Record demo GIF/video
- [ ] Publish DEV submission with public project ID/dataset link as required

## What makes the submission non-generic

Do not sell this as "AI answers Linux questions." The differentiator is:

> The app makes *wrong turns* first-class output and explains the exact context mismatch.

The best judging demo is one question where ordinary search surfaces multiple plausible answers, while Signpost correctly separates them by system context using Sanity-grounded evidence.

## Stretch ideas

- Paste `fastfetch --structure ...` or a compact diagnostic command output to auto-fill the profile.
- "Compare contexts" mode: show how the answer changes for Fedora/GNOME/Wayland vs Arch/Hyprland/Wayland.
- Risk labels: safe check / reversible config / package change / kernel or boot-level change.
- Source freshness indicator.
- Shareable troubleshooting permalink with redacted system profile.
