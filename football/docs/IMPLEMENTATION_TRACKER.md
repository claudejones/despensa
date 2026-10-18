# NFL Intelligence — implementation tracker

**Target release:** v1.0 (not yet complete)  
**Current development build identifier:** v0.4.6  
**Development branch:** `football-screen-by-screen-implementation`  
**Published production:** prior v0.4.x build; this branch is NOT published.

Status legend: **Implemented (unverified)** means code committed but not browser-tested. **Pending** means incomplete. **Approved** means design approved by user, not implemented.

| Screen / system | Approved design | Implementation status | User review |
|---|---|---|---|
| Shared shell and bottom navigation | Approved: five tabs, light-only, no swipe | Existing implementation, not acceptance-tested | **Do not review yet** |
| Home weekly overview | Approved | **Implemented (unverified)** in this branch: summary metrics, independent intelligence accordions, Kalshi summary, Performance link | **Do not review yet** |
| Season Overview | Approved | **Implemented (unverified)**: Weeks/Season Summary, 18-week cards, close button, global week persisted on selection | **Do not review yet** |
| Games and research | Approved | **Implemented (unverified)**: independent research accordions, small logos with fallback, time-window pills; source-category mapping and browser tests still pending | **Do not review yet** |
| AI Picks and Office Pool | Approved | **Implemented (unverified)**: compact cards, small logos, time pills, equal-width buttons, toggle selections and copy action; clipboard and browser tests still pending | **Do not review yet** |
| Combo overview Plans A–E | Approved | Existing overview implemented, needs visual/browser validation | **Do not review yet** |
| Plan Detail / payout sheets / scenario economics | Approved | **Implemented (unverified)**: tickets, kickoff order, payout sheets, exact enumerated settlement scenarios with shared-game outcomes; still needs browser tests and portfolio editing | **Do not review yet** |
| Kalshi Build/Evaluate/Monitor/Close | Approved | **Implemented (unverified)** stage filtering, event journal and partial-sale calculations; validation and safeguards still incomplete | **Do not review yet** |
| Performance Dashboard | Approved | **Implemented (unverified)** season/selected-week metrics, realized P&L, weekly bars, singles vs combos; detailed strategy/AI calibration pending | **Do not review yet** |
| Settings | Approved: light only, no swipe | Simplified, needs visual review | **Do not review yet** |
| Weekly research + prediction engine | Approved concept | Existing JSON and reusable workflow instructions; scheduled research and validated AI probabilities NOT active | **Do not review yet** |
| Automated iPhone-width/browser acceptance tests | Required | **Pending** | **Do not review yet** |
| Verified GitHub Pages release | Required | **Pending** | **Do not review yet** |

## Version rules
- `v0.4.6`: development checkpoint, not a published or complete release.
- `v1.0`: reserve for the fully implemented and verified release.
- Update this tracker in every subsequent development change. Never mark a screen done solely from a JavaScript syntax check.

## Next work queue
1. Verify Season Overview and Home against the actual approved mockups, including header calendar toggle and global week state.
2. Validate Games and AI Picks at iPhone widths, verify accurate research category mapping, and test office-pool clipboard and persistence.
3. Implement Combo / Plan Detail full financial and overlapping-outcome analysis.
4. Complete Kalshi ticket lifecycle, cash-out event ledger and accurate partial sale accounting.
5. Finish Performance and historical dashboard.
6. Add automated interaction and visual checks; only then publish for iPhone testing.

## v0.4.6 checkpoint
- Games and AI Picks now share Cancún-local kickoff-window pills, compact team logo treatment, and image fallbacks.
- Office-pool buttons expose selection state to accessibility tools and retain tap-to-deselect behavior.
- JavaScript syntax checked. **No browser or visual acceptance tests performed yet.**

## v0.4.6 checkpoint
- Plan Detail now enumerates possible game winner combinations, rather than assuming ticket independence.
- Best and worst settlement net reflect shared underlying games and actual supplied historical ticket stakes and gross payouts.
- Plans A–E show tickets, outcomes, timing, overlap and plan-specific payout sheets.
- Historical quote status is explicit. No live prices or validated expected value are claimed.
- JavaScript syntax passed; browser and financial fixture tests still pending.

## v0.4.6 checkpoint
- Performance now includes season/selected-week switch, realized cost basis/proceeds/ROI/open risk, weekly P&L bars, and singles vs combos.
- Kalshi workflow stages and partial-sale event helpers from previous checkpoint remain implemented but unverified.
- Remaining: purchased-ticket immutability, settlement verification, precise partial-sale fees, bankroll transfers, full strategy breakdown, AI accuracy, historical learning and browser tests.
- Do not mark release ready based on syntax validation.
