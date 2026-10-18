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

## v1.2 approved shared ticket flow

- Implemented the inline prototype approved October 17: native bottom sheet, contextual single/new combo/existing combo destinations, active-ticket switcher, Undo, editable copies of strategy tickets, and final Kalshi draft review.
- Full team names, local logos, records, kickoff/daypart formatting, Lucide icons and existing light design tokens are reused. Fixed ticket bar measures navigation height and reserves content space; sheet supports native modal focus and dismissal.
- Draft selection edits clear obsolete pricing and validated probabilities. Undo restores the prior draft; purchased tickets stay protected. Duplicate games within a combo are blocked, shared games across drafts are identified, and incomplete one-leg combos cannot be recorded as purchases.
- Active draft and tickets persist locally. Office Pool storage, ledger events, research data and financial calculations remain intact.
- Local shared-flow checks passed 320/375/430px; contextual/sticky suite passed 320/390/430px; four-width smoke, 10 financial fixtures and full lifecycle/backup suite passed. Actual mobile screenshots inspected. Physical iPhone Safari remains a user verification step.
- Research remains preliminary; this release changes the approved ticket interaction, not the research evidence.
- Published through PR #9 at application commit `06bcd6926b8e84e6d3c5baa50e227a501837586e`. Development acceptance 39094894245, main acceptance 39094963741 and Pages deployment 39094963315 succeeded.
- Live shared-ticket flow passed 320/375/430px, including contextual additions, Undo, editing suggestions, quote invalidation/restoration, persistence, switching and overlap. Live index, CSS and all four application scripts matched tested files byte-for-byte.
- Production: https://claudejones.github.io/despensa/football/?v=1.2


## v1.2.1 Week 6 research refresh

- Research snapshot: October 17, 2026, 11:00 PM America/Cancun. All 13 upcoming matchups refreshed across form, injuries, matchup, markets and history, with source links per category. Thursday final recorded separately.
- 13 qualitative AI leans include supporting/opposing evidence and pregame timestamps. No calibrated probabilities or numeric EV are claimed.
- 26 Kalshi side snapshots include bid/ask, retrieval time, fee/depth limitations and settlement rules. API metadata updated_time is stored separately from retrieval time.
- All 15 existing strategy tickets retain original legs and historical quote values; each has a new research review. Final inactives, weather and fresh combo quotes remain unverified.
- Original saved tickets, pool selections, financial arithmetic and ledger are unchanged. JSON schema, source references and historical quote preservation verified; mobile, financial, lifecycle and shared-ticket suites passed locally. Research display screenshots inspected at 375px.

## v1.3 research briefings and readable evidence

- User-approved Home consolidation: three full-width cards with accurate Games / AI research leans / Combo candidate counts. Each opens a native mobile briefing sheet with supporting details, Close, and a direct action to the corresponding tab. Closing restores focus and the Home position.
- Games: team-grouped availability with 115 sourced player entries, full names, spelled-out positions, status badges and matchup implications. Selected key updates are explicitly distinguished from a complete final inactive list.
- Expanded form and historical cards now add distinct sourced facts and context instead of repeating records and summary text. Sources are tucked into independent disclosures with correct chevrons.
- Compact Kalshi YES ask snapshots appear in Games, AI Picks and plan ticket details. Expanded market details separate bid/ask, snapshot time, AI lean comparison and price/settlement explanations. Historical candidate quotes and pregame forecast records are unchanged.
- Research version `2026-10-17-detail-3`. Existing October 17 11:00 PM market captures retain their timestamps; expanded research has its own check time. No new numerical forecast or combo payout is invented.
- Local checks: weekly schema, unchanged predictions/market snapshots/candidates, player and insight source references; four-width smoke; 10 financial fixtures; lifecycle/backup; contextual/sticky navigation; shared ticket builder; three-width briefing and research display checks. Mobile screenshots inspected. Physical iPhone Safari remains part of user acceptance.

## v1.3.1 active ticket bar positioning

- Fixes the reported active combo bar slipping behind the tabs during iPhone Safari toolbar changes. The bar and navigation now share one fixed container and stack in normal layout, eliminating independent bottom offsets.
- Container/bar resize observation maintains content clearance and toast offsets. Existing visibility rules, drafts, selections and storage are unchanged.
- Added scroll/viewport-height/safe-area regression coverage at 320/375/430px, asserting adjacency, viewport anchoring, unobscured View ticket hit targets, working sheet opening and unchanged ticket data. Shared ticket flow passed at all three widths; screenshot inspected. These simulations do not reproduce the physical iPhone browser toolbar itself.

## v1.3.2 — drawer layout and navigation (2026-10-18)
- Shared research/ticket sheet uses a compact header, 20px close icon in a 44px target, independently scrolling content, and a separate briefing footer. Section spacing is consistent; footer cannot cover the final research lines.
- Newly opened sheets reset to the top, including switching sheet content. Tab taps (including active tab) and reloads return the page to the top. Closing a sheet retains the underlying page context.
- Reuse Cancún date/hour formatters and retain already-rendered Lucide SVGs instead of rebuilding them on each UI synchronization. Touch controls use manipulation behavior.
- Added sheet-navigation acceptance at 320/375/430px, viewport resizing, reset behavior, single-tap navigation, icon identity, and unchanged ticket/pool data. Inspected actual mobile screenshots. Existing briefing, ticket-flow and dock suites passed locally; publication gated on full GitHub acceptance.
- Physical iPhone Safari toolbar behavior remains a user-device confirmation; browser chrome cannot be programmatically forced to expand.

## v1.3.3 — meaningful research updates and calendar cleanup (2026-10-18)
- Added per-device/per-season/week research baselines and unread change records, separate from ticket and pool storage. First load establishes a baseline; source-check timestamps and version-only refreshes do not produce badges.
- Teal Updated pills identify affected Home summaries, Games/AI Picks/Combos headings, strategy cards and individual game/pick/candidate cards. Two gentle pulses respect reduced motion. What changed shows changed categories, player status/YES ask/pick changes where available, and an explicitly labeled Cancún detection time.
- Mark reviewed clears only the displayed changes; closing the sheet retains unread state. Read/unread state survives reloads. Detection runs when weekly JSON is loaded; this is not a live market feed or background polling feature.
- Removed the redundant Open selected week CTA. Selecting a calendar week still loads it and closes Season Overview.
- Added mobile tests at 320/375/430 for timestamp-only refreshes, actual changes, read persistence, selective clearing, reduced motion, no nested buttons, calendar selection, and unchanged personal data. Screenshots inspected. Full acceptance gates publication.
