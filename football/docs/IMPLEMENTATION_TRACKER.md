# NFL Intelligence — implementation tracker

Release history: original implementation merged via PR #7; subsequent releases are recorded below. Current update: **v1.5.2**, publication gated by mobile acceptance and Pages verification.

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

## v1.3.4 — real preferences and app-styled messages (2026-10-18)
- Settings now configures start screen, expanded research defaults, update pulse animation and 12/24-hour formatting (Cancún retained). Defaults preserve existing behavior; individual accordion toggles still work. Preferences persist separately and travel with validated backups; old backups remain supported.
- Removed informational appearance/team cards and calendar/Performance navigation from Settings. About contains name/version. Performance remains available from Home and Season Summary.
- Replaced browser alerts, confirmations and copy fallback with accessible light native-dialog modals, appropriate status emoji, 44px controls, focus management, Escape/cancel behavior and scroll lock. Errors preserve an underlying ticket sheet. Financial/import actions await explicit confirmation; cancellation does not mutate records.
- Existing lifecycle acceptance now uses actual modal controls, including cancelling an executed-sale confirmation before recording it. Added 320/375/430px preference persistence, research defaults, 24-hour formatting, animation disable, duplicate-game modal, underlying draft preservation and unchanged personal-data checks. Mobile screenshots inspected; full CI gates publication.

## v1.3.5 — progressive research and selection market signals (2026-10-18)
- Games now show one collapsed Research insights group; its five categories remain independently expandable. Existing AI rationale and combo research accordions retain progressive disclosure; ticket selections and pricing remain directly accessible.
- Research display preference now supports Collapsed / Categories visible / All details expanded. Legacy expansion preferences and older backups migrate safely. Market source defaults to Kalshi → research fallback, with a Kalshi-only alternative.
- Ticket selection and editor market blocks sit below team names with an independent percentage, exact YES/NO label, source and captured time. Existing entered leg prices remain separately labeled. Game/AI market strips use the same resolver and consolidate matching source metadata.
- Resolver prefers the latest exact-team/side Kalshi ask, then latest sourced researchMarketEstimates entry, otherwise Unavailable. No opposite-team substitution, inferred NO price, multiplied combo probability, AI-confidence substitution or ticket-quote mutation. Scope checks prevent another week's price being used on a ticket.
- Optional researchMarketEstimates schema: gameId, full team name, side YES/NO, probability 0–1, capturedAt ISO timestamp, sourceName and HTTPS sourceUrl. Publishers must verify the estimate matches that outcome, including settlement semantics. Current research has no non-Kalshi estimates; no fallback values were invented. Meaningful update detection includes new/changed/removed estimates without flagging empty-schema additions.
- Added 320/375/430 mobile acceptance for nested disclosure, preference migration, newest fallback, unavailable/invalid/NO handling, week isolation and ticket preservation. Screenshots inspected; existing preference, briefing and regression tests gate publication.

## v1.4.0 — visible Performance and a dedicated My Pool flow (2026-10-18)
- Home now has a standalone Performance card after weekly intelligence, with selected-week realized P&L, open exposure and Pool results. Dashboard views separate Kalshi from Office Pool, retaining Season / Selected Week. Performance remains reachable when the selected week has no research.
- AI Picks separates AI Analysis / My Pool. My Pool shows completion for the published slate, All / Missing filters, equal-width team controls, change/clear and Copy My Picks. Games and AI research share a Choose a pick section with independent Pool and Kalshi destinations. Combo details offer an individual game winner chooser; no strategy-wide Pool import or NO-to-opponent inference.
- Fill missing picks from AI previews every addition with team/logo/context and explicitly preserves existing selections. Cancellation does not save; unavailable AI stays missing. Existing football-pool-v03 choices and all Kalshi storage/financial behavior are preserved.
- Office Pool comparisons grade only published final scores, keep unfinished/unavailable games Pending, and separate ties. AI comparison requires a recorded pre-kickoff frozen choice. No market-based result inference or claimed verified submission history. Current published coverage is Week 6; upcoming games have no final results.
- Added mobile acceptance at 320/375/430 for Pool choose/change/clear, persistence, missing filters, preview/cancel/confirm, preservation of existing choices and Kalshi tickets, individual combo-game chooser, final/tie/late-AI handling and week isolation. Updated existing mobile and lifecycle selectors for the dedicated Pool view. Full local regression suite passed; Home, My Pool, preview and Performance mobile screenshots inspected. CI gates merge; deployed assets and live interaction checks gate delivery.

## v1.4.1 — season grid cleanup (2026-10-18)
- Removed the duplicate selected-week box beneath the Season Overview grid; selection and availability remain visible on the week buttons.
- Changed the AI snapshot label from Frozen to Pick recorded. This is the stored pre-game prediction timestamp, not a live market timestamp. Confidence remains a qualitative assessment, not a numeric win probability. Research and user data unchanged.

## v1.4.2 — clear summary actions and connected Kalshi steps (2026-10-18)
- Home intelligence cards explicitly say View summary; drawer titles describe summaries and onward buttons use View game details, View AI analysis and Explore combo strategies. The AI destination always opens AI Analysis even after My Pool was used.
- Kalshi uses four connected, numbered, directly accessible Build / Evaluate / Monitor / Close steps, current-step highlighting, accessible aria-current and a concise explanation. No completion state is inferred from navigation.
- Season Summary Performance action uses a full-width flex layout with a consistently sized and centered arrow.
- Existing mobile smoke, briefing, navigation and ticket/backup lifecycle checks passed. Focused mobile checks cover summary destinations, all workflow steps and arrow alignment at 320/375/430px; screenshots inspected before publication. No research or personal-data changes.

## v1.4.3 — consistent sentence-case actions (2026-10-18)
- Applied View game research, View combo strategies, View strategy details, Review ticket, Find picks in Games and Closeout. Pool actions use Copy my picks and View AI analysis. AI/NFL abbreviations and named navigation destinations retain their capitalization.
- Retained Save weekly review: this saves the weekly review record and does not independently settle tickets. Labels only; routing, calculations, research and user data unchanged.

## v1.4.4 — action spacing and update preservation (2026-10-18)
- Edit selections uses a 20px icon, flex centering, 8px label gap and 12px vertical separation from ticket legs and pricing. Shared wrapping action groups add 10px gaps to closeout, learning and manual-builder buttons; existing grid/navigation gaps retained.
- Weekly research loading re-reads saved Pool choices and only writes when a legacy key actually needs migration. Ordinary updates no longer rewrite Pool storage; unreadable Pool storage is left intact on load. Stable ticket, Pool, bankroll, learning, preferences and active-draft keys retained. No data reset or version-key migration added.
- Added raw-storage preservation checks covering saved drafts, a purchased position with partial sale, choices across weeks, funding, notes, preferences and active draft through reload/version-query changes and research reload. Also verifies unreadable Pool storage survives load and Edit button spacing at 320/375/430. Existing mobile and financial lifecycle tests gate publication.

## v1.4.5 — stable pricing edits and per-leg quote capture (2026-10-18)
- Pricing changes save without redrawing the page; only calculated totals and draft stake update, preserving field nodes, focus, scroll and accordion state. Invalid values remain in place for correction.
- Every draft leg has an editable Quoted probability percentage, exact outcome label and timestamped source. Blank defaults to the existing exact-side market resolver (Kalshi, then permitted researched estimate); missing remains unavailable. Manual overrides do not overwrite research snapshots.
- Distinct binary-game percentages multiply into an explicitly independence-assumed market estimate, never a calibrated probability or executable combo quote. Same-game combinations/props or missing quotes remain unavailable. Actual stake/payout/fees and optional actual ticket quote remain separate; break-even and profit calculations are unchanged.
- Recording purchase freezes per-leg quote values, source labels and captured timestamps. Purchased quote controls are read-only; old purchased tickets without snapshots are not backfilled. Changing a selection clears its override.
- New 320/375/430 browser coverage verifies no blur redraw/jump, overrides, fallback, zero/invalid/missing values, repeated-game exclusion and immutable quote snapshots after research changes/reload. Financial fixtures, full purchase/sale/settlement/backup lifecycle, shared builder and update-preservation tests passed locally; screenshots inspected.

## v1.5.0 — clearer Kalshi workspace (2026-10-18)

- Replaced numbered workflow with Drafts, Analysis, Open bets and History; direct Performance access.
- Compact expandable ticket summaries retain expansion during edits and rerenders.
- Analysis lists every priced game with “Included in N tickets,” ticket names and an overlapping-exposure explanation.
- Separate observations, executed cash-outs and settlement. Purchased quote history is read-only or “Not recorded.”
- Profit labels account for stake and fees; partial-sale potential includes realized cash-outs plus remaining potential.
- Workspace, lifecycle, quote editing, financial and raw storage preservation regression coverage; mobile screenshots at 320/375/430px. No save-key changes or personal-data migrations.

## v1.5.1 — selection exposure, optional Pool and closing bets

- Exposure groups exact team/outcome selections, with team logos and individual ticket names.
- Picks navigation and direct My Pool Home access; no Pool result on Home until selections exist.
- One Close or reduce bet section: I sold early / The bet finished. New proceeds are net of fees; removed new sale/settlement fee inputs. Legacy fees remain in historical calculations and backups.
- Name-only editing for drafts, open and closed tickets; financial terms and history protected.
- Mobile acceptance includes partial net cash-out, final zero payout, legacy fee preservation, Pool nonparticipation and ticket renaming.

## v1.5.2 — simple Analysis, direct pick actions and payout correction

- Removed repeated selection exposure from Analysis; combined totals describe the ticket cards below. Cards start collapsed on entry.
- Replaced Choose a pick accordion with visible Pick for My Pool and Add to Kalshi ticket buttons, each opening its own drawer.
- Open tickets support correction of the original gross payout; history records old/new amounts, while selections, cash-outs, locked quote snapshots and stored records are preserved.
- Regression coverage includes direct destination independence, invalid correction input, partial-sale correction math, reload persistence and collapsed Analysis.

## v1.6.0 — refined tickets and verified score reconciliation

- Approved compact single/combo hierarchy: one header, selections, purchase details, calculation disclosure and Activity; readable purchased amounts replace disabled fields. Closing and observations use focused drawers.
- Refreshed Oct 18 score snapshots from ESPN; Houston 34–31 Jacksonville final corroborated by Jaguars official game report. Original research/market timestamps and pregame records remain intact.
- Automatically records $0 remaining payout for purchased full-game winner tickets defeated by a verified final result, including combos. Drafts, winners, live/tied/unverified results and unsupported markets do not auto-close.
- Preserves previous cash-outs, fees, quotes and original records; adds source-backed Activity event and reversible automatic result. Undo opts that ticket out of automatic closing. Repeated loads do not duplicate events.
- Scores are published snapshots, not a continuous live feed. Reconciliation applies to the loaded season/week on the user's device; no Kalshi account access or personal ledger publication.
- Regression covers NO outcomes, partial proceeds, manual records, scope, repeat loads and undo at 320/375/430 px.

## v1.6.1 — All-in ticket amounts
- Removed separate entry fee input and purchase-detail fee row. Total paid includes trading costs; cash-outs use actual credited amounts.
- Legacy saved fees remain in accounting. Editing a legacy draft total folds its old fee into the new all-in amount; reloads leave stored records unchanged.
- Verified financial acceptance, all-in pricing, and update preservation at 320/375/430px.
