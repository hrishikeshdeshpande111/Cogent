# Robinhood: Compliance-First Trading Rules (F-1 / NO Day Trading)

This project must **never** day trade. You are an **F-1 visa student** and you are **not allowed to day trade**. If any instruction, idea, or automation conflicts with this rule, **stop immediately** and do not proceed.

## Non-Negotiable Rules (Hard Stops)

1. **No same-day round trips**
  - Never buy and sell (or sell and buy to close) the same security on the **same calendar day**.
  - If a proposed action would close a position opened that same day, it is **forbidden**.

2. **Minimum holding period**
  - Every opened position must be held for **at least 5 full trading days** before closing.
  - Exception: corporate actions (e.g., delisting, merger) or broker-forced liquidation. If this occurs, document it.

3. **No “pattern day trading” behavior**
  - Do not place trades that could be interpreted as day trades or that approach “multiple intraday round trips.”
  - If there is any ambiguity, treat it as **not allowed**.

4. **Trade frequency cap**
  - Maximum **1 new position entry per week**.
  - Maximum **1 position exit per week**.
  - If a plan requires more frequent trading, it is **forbidden**.

5. **No intraday “management”**
  - No scalping, no rapid stop-loss adjustments, no “in-and-out” reactions to minute-by-minute movement.
  - No monitoring with the intent to trade intraday.

6. **No leverage / margin / complex instruments**
  - Do not use margin, leveraged ETFs/ETNs, options, futures, or any instrument that increases short-term trading pressure.
  - Keep the scope to simple, long-only equity swing trades unless explicitly revised with compliance in mind.

7. **Automation must enforce these constraints**
  - Any use of the Robinhood MCP must include guardrails that **block** forbidden actions (entries/exits that violate holding period or same-day rules, frequency caps, or ambiguous cases).
  - If guardrails cannot be implemented reliably, automation must be **disabled** (analysis-only mode).

## Project Goal (Allowed Behavior)

The goal is to **slowly scout for swing trade opportunities** over **1–2 weeks**, aiming for reasonable returns through:

- Research-driven watchlists
- Thesis-based entries
- Predefined exits (targets/invalidations) that assume multi-day holding
- Minimal trade count, high selectivity

## Operating Mode (Weekly Cadence)

- **Mon–Thu:** scout, read, and refine watchlists; do not “chase” intraday moves.
- **Fri (or one chosen day):** consider **at most one** entry or exit decision for the week.
- All decisions must be documented in writing (thesis + risk + invalidation + planned hold time).

## Guardrails Are Mandatory

This repo enforces process guardrails that must be followed before any order:

- `robinhood/guardrails.md:1` (required preflight + hard blocks)
- `robinhood/state.json:1` (weekly caps tracking)
- `robinhood/trade-journal.md:1` (required written checklist)

## Required Pre-Trade Checklist (Must Be Written Down)

Before any entry:

- Ticker:
- Entry rationale (1–3 sentences):
- Time horizon: **7–14 days** (minimum hold rule still applies)
- Invalidation level (what proves the thesis wrong):
- Position size rule:
- Planned exit rule (target and/or time-based):
- Confirmation that the trade:
  - Is **not** a same-day round trip
  - Will be held **≥ 5 trading days**
  - Does not exceed weekly frequency caps
  - Uses **no** leverage/margin/options

## If You Ask for Something Disallowed

If you ask to:

- day trade,
- “quick scalp,”
- make multiple same-day round trips,
- or otherwise violate the rules above,

the correct response is: **refuse and switch to analysis-only scouting**.
