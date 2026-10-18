# NFL Intelligence — approved visual reference pack (v1.0)

This directory is the **design source of truth** for the v1.0 implementation. The standalone HTML reference is `index.html`; it has a screen picker and supports `?screen=home|season|games|picks|combos|plan|kalshi|performance|settings`.

## Approved visual contract
- Light-only design, five bottom tabs, no swipe, global week calendar icon, no duplicate week dropdown.
- Compact small NFL logos, full team names with records, consistent neutral kickoff pills and Cancún timezone.
- Independent chevron research accordions with collapsed summary and expanded bullet details.
- Office-pool team buttons: equal width, small logos and uppercase abbreviations; tap select, tap again deselect; copy explicit winners.
- Season navigator: week grid, Weeks / Season Summary switch, integrated close control.
- Combo overview A–E -> dedicated Plan Detail Tickets / Outcomes / Timing, plan payout sheet and risk.
- Kalshi Build / Evaluate / Monitor / Close; Performance season and selected-week views; Settings light only.

## Important limitations
Reference HTML is a **visual and interaction prototype**, not the production application or a live data source. It uses illustrative content and locally defined samples, and must not be used as evidence of real NFL results or executable Kalshi prices. The production agent must implement the complete approved functionality and validated calculations.

## Implementation workflow
1. Inspect the reference at 320, 375, 390 and 430 CSS px.
2. Capture screenshots of each reference screen, and of the corresponding production screen at the same width.
3. Compare hierarchy, spacing, labels, touch targets, logos, accordions, bottom navigation and safe-area behavior.
4. Run functional tests on the production application for all approved interactions.
5. Only deploy after acceptance checks pass and verify the deployed commit.

See `../docs/APPROVED_MOBILE_UI_RELEASE_CONTRACT.md` and `../docs/APPROVED_OFFICE_POOL_UX.md` for functional specifications. Later user-approved changes supersede earlier mockups.
