# NFL Intelligence — implementation tracker

**Target release:** v1.0 (not yet complete)  
**Current development build identifier:** v0.4.2  
**Development branch:** `football-screen-by-screen-implementation`  
**Published production:** prior v0.4.x build; this branch is NOT published.

Status legend: **Implemented (unverified)** means code committed but not browser-tested. **Pending** means incomplete. **Approved** means design approved by user, not implemented.

| Screen / system | Approved design | Implementation status | User review |
|---|---|---|---|
| Shared shell and bottom navigation | Approved: five tabs, light-only, no swipe | Existing implementation, not acceptance-tested | **Do not review yet** |
| Home weekly overview | Approved | **Implemented (unverified)** in this branch: summary metrics, independent intelligence accordions, Kalshi summary, Performance link | **Do not review yet** |
| Season Overview | Approved | **Implemented (unverified)**: Weeks/Season Summary, 18-week cards, close button, global week persisted on selection | **Do not review yet** |
| Games and research | Approved | Partial, independent accordions need visual verification and correct research mapping | **Do not review yet** |
| AI Picks and Office Pool | Approved | Partial, button layout and clipboard need browser validation | **Do not review yet** |
| Combo overview Plans A–E | Approved | Partial | **Do not review yet** |
| Plan Detail / payout sheets / scenario economics | Approved | Partial, comprehensive shared-outcome evaluation missing | **Do not review yet** |
| Kalshi Build/Evaluate/Monitor/Close | Approved | Partial, ticket editing and partial-sale accounting require more work | **Do not review yet** |
| Performance Dashboard | Approved | Partial, historical charts and season/weekly metrics missing | **Do not review yet** |
| Settings | Approved: light only, no swipe | Simplified, needs visual review | **Do not review yet** |
| Weekly research + prediction engine | Approved concept | Existing JSON and reusable workflow instructions; scheduled research and validated AI probabilities NOT active | **Do not review yet** |
| Automated iPhone-width/browser acceptance tests | Required | **Pending** | **Do not review yet** |
| Verified GitHub Pages release | Required | **Pending** | **Do not review yet** |

## Version rules
- `v0.4.2`: development checkpoint, not a published or complete release.
- `v1.0`: reserve for the fully implemented and verified release.
- Update this tracker in every subsequent development change. Never mark a screen done solely from a JavaScript syntax check.

## Next work queue
1. Verify Season Overview and Home against the actual approved mockups, including header calendar toggle and global week state.
2. Complete Games and AI Picks with proper logo fallbacks, compact time pills, and research summaries.
3. Implement Combo / Plan Detail full financial and overlapping-outcome analysis.
4. Complete Kalshi ticket lifecycle, cash-out event ledger and accurate partial sale accounting.
5. Finish Performance and historical dashboard.
6. Add automated interaction and visual checks; only then publish for iPhone testing.
