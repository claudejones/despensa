# Approved mobile screen contract — release gate

This document consolidates the user's approved design decisions. It is a **mandatory acceptance contract**, not a claim of implementation.

## Shared shell
- Light-only near-white surfaces, navy text, restrained teal highlights. No dark theme.
- Five fixed, equal-width bottom tabs: Home, Games, AI Picks, Combos, Kalshi. No scrolling tab bar. No swipe navigation.
- Global week selector via calendar icon in the header. Season overview displays 18 weeks; tapping a week updates all sections and closes overview. No duplicate dropdown.
- Automatically open current NFL week, preserving manually selected week within navigation.
- Small consistent team logos with abbreviation fallback; full team names and W-L-T records always visible.
- Compact neutral Morning / Afternoon / Late afternoon / Evening pills plus actual weekday, date, kickoff and configured timezone.
- Lucide icons, 44px minimum touch targets, proper safe-area spacing, accessible labels, no decorative emoji.

## Home
- Compact weekly status, research availability, counts, Kalshi open-risk summary, link to Performance. No oversized placeholder report.

## Games
- Compact two-line matchup; separate independent full-width accordions for Form, Injuries, Matchup, Market, Historical Insights.
- Each collapsed category shows icon, title, one-line summary, down chevron. Expanded shows detailed bullets, provenance and up chevron. Multiple categories can remain open.

## AI Picks / Office Pool
- Compact matchup with two 24–28px logos, records, date and daypart.
- Distinct AI predicted winner, independently estimated probability, confidence, timestamp, supporting/opposing evidence. If unavailable, explicitly say pending.
- Independently expandable 'Why this selection?' summary and bullet details.
- Office pool: two **equal-width** buttons with small team logo and uppercase abbreviation, accessible full-name label. No overflow at 320px. Tap once select, tap again deselect, tap other switches. Persist by season/week.
- Selection count X of Y and Copy My Picks. Copy plain-text chronological list with explicit WINNER, opponent, both records, game time; warn if incomplete, allow copy.

## Combos
- Five compact strategy cards A–E. Tap opens dedicated Plan Detail with Tickets / Outcomes / Timing views.
- Individual tickets identify Single Game Bet or Combo, full teams and records, small logos, YES/NO, date and daypart, AI vs Kalshi probabilities distinctly.
- Plan-level total stake, best/worst settlement outcomes, overlap and common-failure risk. Payout sheet immediately beneath plan tickets. Historical quotes explicitly labeled.
- Add to Kalshi drafts only; no trade placement.

## Kalshi
- Build → Evaluate → Monitor → Close. Import AI candidates or build custom singles, combos, player props with actual game/market/leg selection.
- Editable quotes, stake, fees, gross payout, independent probabilities, break-even, ROI and expected net only if probability validated.
- Evaluate individual and combined portfolios with shared exposure.
- Track observed cash-out offers, hold/sell decisions, partial cash-outs, fees, and immutable event history. Never equate offered price with executed sale.
- Close week, export for ChatGPT, full backup and import. Personal ledger never overwritten by research updates.

## Performance
- Season / Selected Week using **global week**, no extra dropdown.
- Realized P&L, ROI, capital invested, proceeds, bankroll, open exposure, weekly/cumulative charts.
- Strategy A–E, singles vs combos, AI forecast calibration, office pool vs AI, decision history, weekly learning and export status. Separate realized from unrealized.

## Release gate
- Run DOM and JavaScript integration tests in a browser, not only syntax checks.
- At least 320px, 375px and modern iPhone viewport tests.
- Assert all nav actions, calendar selection, week-6 JSON load, game accordions, office-pool toggle and copy, plan navigation, draft import, quote calculations, persistence, backup import/export.
- Verify published GitHub Pages content **and deployed commit/version** after deployment. Never claim release-ready before passing.
- Avoid edits to production main until approved UI is implemented and tested in development.
