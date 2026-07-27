# Workspace Notes

This repository is the shared workspace for the Cogent Codex agent and the user.

## Purpose
- Keep durable project context here when it is useful to preserve between sessions.
- Store short notes, decisions, conventions, and reminders that should travel with the repo.
- Avoid putting sensitive secrets or disposable chat history in this file.

## Current Conventions
- Treat `main` as the active working branch unless the user asks otherwise.
- Keep repository guidance in [AGENTS.md](AGENTS.md).
- Prefer small, reviewable commits for workspace notes and setup changes.

## Working Notes
- This repo contains workspace guidance plus two working subprojects: `jobapp-os/` and `robinhood/`.
- `jobapp-os/` has Node/TypeScript tooling (`jobapp-os/package.json`) and a local-first CLI workflow.

## Robinhood (MCP)
- A Robinhood **agentic-allowed cash** brokerage account is connected for MCP actions (account `••••9997`).
- Objective: **swing trade** (multi-day holds) to target steady returns, with **strict NO day trading** constraints (see `robinhood/robinhood.md`).

## jobapp-os
- Objective: job search + application workflow OS (search, queue, notes, semi-automated ATS filling with user submit).
- Primary docs: `jobapp-os/USER_GUIDE.md`
