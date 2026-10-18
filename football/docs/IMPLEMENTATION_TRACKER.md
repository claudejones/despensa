# NFL Intelligence — implementation tracker

Published release: **v1.1**. Implementation merged from `football-screen-by-screen-implementation` to `main` via PR #7; contextual review follow-up via PR #8.

## Implemented and locally verified

| Screen | Delivered behavior | Verification |
|---|---|---|
| Shared shell | Light-only; five fixed tabs; bundled Lucide; bundled 32 team logos; no swipe; safe areas; calendar toggle | 320/375/390/430px browser checks and screenshots |
| Home | Selected-week research, AI availability, candidates, open exposure and Performance | Screenshot inspection, navigation tests |
| Season Overview | 18-week grid, selected state, manifest availability, Weeks/Season Summary, integrated close | Mobile browser checks and screenshot inspection |
| Games | Full names, normalized W–L–T, Cancún kickoff windows and dates, five independent research accordions, snapshot/source links | Mobile browser checks, category placement corrected without deleting claims |
| AI Picks / Office Pool | Validated forecast renderer with supporting/opposing evidence; honest pending state; equal buttons; selection/deselection; season/week persistence; actual multiline copy | Clipboard, reload and narrow viewport tests |
| Combos / Plan Detail | Plans A–E, tickets, historical prices, payout sheets, joint outcome table, shared exposure, chronological checkpoints, draft import | Financial fixtures, navigation tests, three detail screenshots |
| Kalshi | Custom singles/combos/player props, pricing, purchase, joint evaluation, observed offers separate from executed sales, partial sales, fees, settlements, journals, weekly closeout | End-to-end lifecycle test; protected purchased terms; week isolation |
| Performance | Realized net/ROI, cost/proceeds/open exposure, bankroll transfers, strategy and ticket-type comparison, weekly/cumulative chart and table, saved learning | Financial fixtures, screenshot inspection |
| Settings / backups | Light-only conventions, Cancún, version, complete tickets/picks/bankroll/learning export and validated import | Actual downloaded JSON re-import tested |

## Validation evidence

- Mobile browser suite: 320, 375, 390 and 430px. Navigation, independent accordions, equal-width buttons, icon presence, horizontal overflow checks.
- Financial suite: winnings/losses, partial sales, entry/exit fees, final settlement, legacy sold-ticket compatibility, shared-game settlement dependencies.
- Lifecycle suite: clipboard text, reload persistence, candidate import, purchase, observed offer, partial sale, settlement, unavailable-week ledger access, player prop, backup round trip.
- Screenshots inspected locally for all nine requested screen groups and the Plan Detail / Kalshi subviews. Tests generate screenshots as GitHub Actions artifacts.
- Browser engine: headless Chromium at mobile widths. These are not physical iPhone Safari tests.

## Source and data limitations

Original approved screen images could not be recovered from project-history search. Visual review used the user's locked written requirements and actual rendered screens; **pixel-for-pixel equivalence to inaccessible originals is not claimed**. The HTML gallery was not treated as complete artwork.

Only Week 6 preliminary research is published. Validated independent probabilities, frozen forecasts and official final-score history are not present; forecasts/calibration honestly remain pending. Historical Kalshi quotes are not executable live prices. Automated weekly research is not activated. Game-winner scenario tables model win/loss outcomes; ties/voids depend on individual contract rules. Player-prop joint probabilities are not fabricated.

## Verified publication — October 17, 2026 (Cancún)

- PR #7 merged; application release commit `740c527a1208dafad37df0860ae135d8a6ba40ba`.
- Development acceptance run 39091192262: success.
- Main acceptance run 39091267730: success.
- Pages build/deployment run 39091267437: success, matching release commit.
- Live production URL: https://claudejones.github.io/despensa/football/?v=1.0
- Live browser suite passed all four mobile widths. Ten financial fixtures passed against the published app. Full live lifecycle, clipboard, reload persistence and backup round trip passed in isolated test browser storage.
- Live index.html, app.js, features.js, app.css, Week 6 JSON, bundled Lucide and a team-logo asset matched the tested files byte-for-byte. Visible header and Settings show v1.0.
- No private user tickets or selections were uploaded. Source and physical-device limitations above still apply.

## v1.1 contextual review update

- Plan Detail back navigation has a separate padded sticky bar immediately below the measured header, remaining accessible through long ticket lists.
- Games and AI Picks offer contextual team selections with full names, records, logos and kickoff information. Adding saves a single draft without leaving or collapsing the research view; Office Pool picks remain independent.
- Combo candidates likewise save in place; duplicate draft additions are disabled and the Kalshi tab displays the selected week's review count.
- Kalshi Build supports selecting draft singles to create one combo, rejects multiple selections from the same game, and restores the original singles on request. Purchased tickets are untouched. A combined quote is never inferred; new drafts require pricing.
- Contextual review, duplicate prevention, persistence, reversible combination and sticky positioning passed at 320/390/430px. Existing mobile and lifecycle regression suites passed. Screenshots inspected directly.
- Published via PR #8 at commit `3a2a976e5ba7444a11fad78a399a59630575c680`. Branch acceptance 39092062304, main acceptance 39092160056 and Pages deployment 39092159957 all succeeded. Live contextual-review and sticky-navigation tests passed at 320/390/430px; live HTML confirmed v1.1.\n- Production: https://claudejones.github.io/despensa/football/?v=1.1
