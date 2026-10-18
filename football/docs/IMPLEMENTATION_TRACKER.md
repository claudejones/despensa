# NFL Intelligence — implementation tracker

Release candidate: **v1.0**. Branch: `football-screen-by-screen-implementation`.

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

## Publication gate

Local checks passed. GitHub Actions acceptance, merge, Pages build, deployed asset/version verification and live browser tests must all pass before publication is recorded as complete below.
