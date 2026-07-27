# jobapp-os

This is a job-application workflow helper.

Important: LinkedIn actively restricts automation/bot behavior. This project is designed to:

- automate **search + triage + tracking**
- keep **applications user-confirmed** (no unattended “auto-apply” loops)

## What it does

- Opens a LinkedIn job search for “product”
- Applies filters for “Past 24 hours” (by guiding you, or via stable URL params when possible)
- Collects job URLs into a local queue for review
- Generates per-job application notes and a checklist using your resume

## Local data

- Paste resume text into `data/jobapp-os/resume.txt`
- Collected leads are stored in `data/jobapp-os/leads.json`
- Generated per-lead notes are stored in `data/jobapp-os/leads/*.json`
- Single source of truth profile: `data/jobapp-os/profile.md`
- Metrics table (real numbers): `data/jobapp-os/metrics.json`
- Labeled bullet bank: `data/jobapp-os/bullets.json`
- Application pipeline tracking: `data/jobapp-os/pipeline.json`

## Commands

- Build: `npm run build`
- Print search URL: `npm run jobapp -- open-search`
- Add lead URL: `npm run jobapp -- add-url <url>`
- List leads: `npm run jobapp -- list`
- Generate notes/checklists: `npm run jobapp -- gen-notes`
- Extract resume PDF → text: `npm run jobapp -- extract-resume`
- Semi-automated ATS form fill (you review + click submit): `npm run jobapp -- assist-apply <ats-url>`
- Add a metric (real numbers): `npm run jobapp -- metric-add <label> <value> [context]`
- Add a labeled bullet: `npm run jobapp -- bullet-add <label> <text...>`
- Track an application: `npm run jobapp -- pipeline-add <company> <role> [url] [status] [notes]`
- Update application status: `npm run jobapp -- pipeline-status <id> <status>`
- Pipeline stats: `npm run jobapp -- pipeline-stats`

## Safety notes

- This assistant never clicks submit; you must review and submit yourself.
- You may encounter CAPTCHAs / login / dynamic fields that require manual work.
- Do not use this in a way that violates a site’s terms; use at your own risk.
