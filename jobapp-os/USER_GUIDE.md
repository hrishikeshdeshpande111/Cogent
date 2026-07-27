# jobapp-os — User Guide

This project helps you:

- find fresh “product” job posts (last 24 hours)
- queue links you want to apply to
- generate per-job notes/checklists using your resume
- semi-automate ATS form filling (you review and click Submit)
- track your application pipeline and stats

It is **not** a fully unattended auto-apply bot. The apply assistant **never clicks Submit**.

## 0) Setup (one-time)

From the repo root:

```bash
cd jobapp-os
npm install
npm run build
```

## 1) Resume setup

You already have a PDF at `jobapp-os/Hrishikesh_resume.pdf`.

Extract it to text (used for notes/prompts):

```bash
cd jobapp-os
npm run jobapp -- extract-resume
```

This writes your resume text to:

- `jobapp-os/data/jobapp-os/resume.txt`

## 2) Fill your “single source of truth” profile (recommended)

Edit:

- `jobapp-os/data/jobapp-os/profile.md`

Optional but useful:

- metrics table: `jobapp-os/data/jobapp-os/metrics.json`
- labeled bullet bank: `jobapp-os/data/jobapp-os/bullets.json`

Add items via CLI:

```bash
cd jobapp-os
npm run jobapp -- metric-add "Impact: revenue" "$250k" "Pricing change in Q3"
npm run jobapp -- bullet-add "Launch Speed" "Shipped X in 6 weeks by coordinating Y and Z"
```

## 3) Find jobs (LinkedIn search URL)

Print a LinkedIn search URL for “product” jobs posted in the last 24 hours:

```bash
cd jobapp-os
npm run jobapp -- open-search
```

Open the printed URL in your browser (stay logged in).

## 4) Queue jobs you want to apply to

When you find a posting, copy the URL you will apply on (often an ATS link like Greenhouse/Lever/Workday).

Add it to your queue:

```bash
cd jobapp-os
npm run jobapp -- add-url "<url>"
```

List queued URLs:

```bash
cd jobapp-os
npm run jobapp -- list
```

Queue storage:

- `jobapp-os/data/jobapp-os/leads.json`

## 5) Generate per-job notes/checklists (“apply packets”)

Generate notes/checklists for everything in your queue:

```bash
cd jobapp-os
npm run jobapp -- gen-notes
```

Outputs:

- `jobapp-os/data/jobapp-os/leads/*.json`

These are meant to be your “application packets” (what to paste, what to emphasize, what to double-check).

## 6) Semi-automated applying (ATS form fill assistant)

For a specific ATS link, run:

```bash
cd jobapp-os
npm run jobapp -- assist-apply "<ats-url>"
```

What happens:

- A Chromium browser opens.
- You handle any login/CAPTCHA manually.
- The assistant detects fields and prompts you in the terminal for values.
- It fills what it can.
- It tries to upload your resume PDF for fields labeled like “Resume” / “CV”.
- It stops. **You review and click Submit.**

If something can’t be auto-filled (custom widgets, multi-step flows), just complete those manually in the browser.

## 7) Track your pipeline

Add an application entry (recommended right after you submit):

```bash
cd jobapp-os
npm run jobapp -- pipeline-add "Company" "Product Manager" "<url>" "applied" "note"
```

Update status later:

```bash
cd jobapp-os
npm run jobapp -- pipeline-status "<app_id>" "interview"
```

Show stats:

```bash
cd jobapp-os
npm run jobapp -- pipeline-stats
```

Pipeline data:

- `jobapp-os/data/jobapp-os/pipeline.json`

## Status values

Use one of:

- `queued`
- `applied`
- `recruiter_screen`
- `hm_screen`
- `interview`
- `offer`
- `rejected`
- `ghosted`

## Troubleshooting

- If `npm run build` fails: run `npm install` again.
- If `extract-resume` fails: confirm `jobapp-os/Hrishikesh_resume.pdf` exists and re-run.
- If `assist-apply` doesn’t fill a field: the site may use custom controls; fill that field manually.

## Safety / expectations

- This tool is designed to be **human-in-the-loop**.
- It does **not** bypass CAPTCHAs.
- It does **not** click submit.
- Use at your own risk and respect site terms.

