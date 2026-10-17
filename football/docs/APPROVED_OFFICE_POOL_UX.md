# Approved AI Picks / Office Pool UX — 2026-10-17

Status: **Design approved; implementation pending.** Canonical requirement for the upcoming mobile UI redesign. Do not describe these behaviors as shipped until tested.

## Team presentation
- Always show each team's full name, W-L-T record and small team logo in the matchup card.
- In the two equal-width office-pool selection buttons, show the **official team abbreviation** (e.g., NYG, NO, LAC, KC, WAS, SF) and a small logo, not long names that can overflow.
- Buttons must fit a narrow iPhone viewport without clipping, overlapping or horizontal scrolling; use accessible labels containing full team names.
- Use the approved light-first design and Lucide icon library, not decorative emojis.

## Selection interaction
- First tap selects a team as the predicted winner.
- Tapping the same selected team again **deselects** it.
- Tapping the opposing team **switches** the pick.
- At most one selection per game; an unselected game is valid while editing.
- Save selections by NFL season and week, separate from AI forecasts and Kalshi tickets.
- Show a selected-count indicator such as 2 of 13.

## Copy My Picks
- A visible **Copy My Picks** control copies a clean plain-text email-ready list to the clipboard.
- Only games with user selections appear in the list, preserving chronological kickoff order.
- Include season and NFL week, an explicit **MY PICKS TO WIN** heading, and for each selected game:
  1. **WINNER: Full Team Name (record)**
  2. **Opponent: Full Team Name (record)**
  3. Actual weekday and local kickoff time; show date where useful.
- Include `Total selections: X of Y` at the end.
- Never use an ambiguous format such as `Giants — vs. Saints` without explicitly identifying the winner.
- If not all games are selected, warn `X of Y games selected — copy anyway?`, but allow copying after confirmation.
- Disable copying if zero games are selected.
- Preserve the current picks when copying; copy does not lock, submit, or purchase anything.

## Acceptance tests
1. WAS and SF selection buttons remain fully visible at 320px and 375px widths.
2. Tap WAS, tap WAS again => neither selected.
3. Tap WAS then SF => only SF selected.
4. Export two selections => only those two, each explicitly marked WINNER with opponent and correct record.
5. Incomplete slate triggers warning, but allows copying.
6. Picks persist on reload and are scoped by season/week.
7. Team logos have fallback initials if unavailable.
