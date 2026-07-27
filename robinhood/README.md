# Robinhood MCP (Project Usage)

This folder is where we run Robinhood MCP-assisted **scouting** and (only when allowed) **swing trade** execution.

## Default Mode: Analysis-Only

- Use scanners (`get_scans`, `run_scan`) and quotes (`get_equity_quotes`) to build a watchlist.
- No orders are placed unless all guardrails pass.

## Before Any Order

- Read and comply with `robinhood/robinhood.md:1` (F-1 / **NO day trading**).
- Follow `robinhood/guardrails.md:1` step-by-step.
- Log the plan in `robinhood/trade-journal.md:1`.
- Respect weekly caps tracked in `robinhood/state.json:1`.

