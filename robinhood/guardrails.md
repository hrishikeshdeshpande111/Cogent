# Guardrails (Required Before Any Order)

These guardrails exist to enforce `robinhood/robinhood.md:1` (F-1 / **NO day trading**). If any check fails or is ambiguous, **do not trade**.

## Scope

- Applies to **all** trading actions.
- Default mode is **analysis-only**.
- Allowed instrument scope: **long-only US equities/ETFs** (no options, no margin, no leverage).

## Hard Blocks

Block the trade if any of the following is true:

- The action would create a **same-day round trip**.
- The action would **exit** a position held fewer than **5 trading days**.
- The weekly caps would be exceeded: **>1 entry/week** or **>1 exit/week**.
- The action is for a disallowed instrument (options, leveraged products, margin).

## Small-Balance Exception (Still Swing-Only)

If buying power is small (e.g. ~$50), entries may use a **dollar-based market order** for **fractional shares**, but only under all of these constraints:

- **Regular hours only** (9:30am–4:00pm ET).
- **Buy only** (entries). No market sells.
- **dollar_amount <= `robinhood/policy.json:1` → swingTrading.maxDollarAmountPerEntry**.
- Still requires `review_equity_order` first and explicit user confirmation.

## Required MCP Preflight (Equities)

Before placing any equity order, run these checks using the Robinhood MCP:

1. `get_accounts`
  - Confirm the user-selected `account_number`.
  - Confirm the account is permitted for agentic actions if automation is being used.

2. `get_equity_tradability` (symbol)
  - Confirm the symbol is tradable for `regular_hours`.

3. `get_equity_positions` (account_number)
  - If placing a **sell**:
    - Confirm the position exists and quantity is sufficient.
    - Verify the position holding breakdown indicates the shares to be sold have been held for **≥ 5 trading days**.
    - If the holding breakdown cannot prove this, **block the sell**.

4. Local weekly caps (read `robinhood/state.json:1`)
  - If the action is an **entry**: block if `entriesThisWeek >= 1`.
  - If the action is an **exit**: block if `exitsThisWeek >= 1`.
  - If `isoWeekStartDate` is not the current ISO week start, reset counts to 0 and set the new week start date.

5. Require a written checklist (append to `robinhood/trade-journal.md:1`)
  - No trade proceeds without a completed “Pre-Trade Checklist”.

6. Order review step
  - Always call `review_equity_order` first and show all alerts.
  - Only proceed if the user explicitly confirms **after** review.

## State Updates (After a Successful Fill)

After an order is placed and confirmed filled (or if the user confirms the order was executed):

- Update `robinhood/state.json:1`:
  - If entry: increment `entriesThisWeek` and set `lastEntryDate`.
  - If exit: increment `exitsThisWeek` and set `lastExitDate`.

If fill status is unknown, do **not** update counters until confirmed.
