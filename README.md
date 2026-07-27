# Cogent

Github repo for my Codex agent workspace.

## jobapp-os

- Project lives in `jobapp-os/`
- Build: `cd jobapp-os && npm run build`
- Print LinkedIn search URL (open it in your browser): `cd jobapp-os && npm run jobapp -- open-search`
- Add a LinkedIn job URL to the local queue: `cd jobapp-os && npm run jobapp -- add-url <url>`
- List queued URLs: `cd jobapp-os && npm run jobapp -- list`
- Generate per-lead notes/checklists: `cd jobapp-os && npm run jobapp -- gen-notes`
- Semi-automated ATS fill (you review + submit): `cd jobapp-os && npm run jobapp -- assist-apply <ats-url>`
- Pipeline stats: `cd jobapp-os && npm run jobapp -- pipeline-stats`
- Full usage guide: `jobapp-os/USER_GUIDE.md`
