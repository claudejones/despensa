# Automatic AI paper portfolio

Public read-only benchmark, independent of personal tickets and Office Pool. Baseline $2 per entry.

The archive script runs automatically on main when weekly research JSON changes. It captures published model predictions before kickoff and explicit AI-origin combo candidates (origin: ai, modelVersion, generatedAt, legs). Existing IDs are immutable. Picks without eligible prices retain result-only tracking; later prices do not backfill them. Combo payouts require a sourced, timestamped ticket quote at or after publication and before first kickoff. Never multiply leg prices to create a quoted combo payout.

Week 6 is labeled reconstructed-pregame: 13 existing timestamped research leans and historical asks, not a claim of prospective execution. These are qualitative leans, not calibrated probabilities. User strategies reviewed by AI do not qualify as AI authored.

Single payout benchmark = $2 / saved YES ask. Fractional sizing and before-cost arithmetic are explicit: this is not executable contract sizing or net trading profit. Combo quoted payouts scale to $2. Win rate includes eligible unpriced selections; financial results require pricing. ROI denominator is settled priced stakes. Open entries remain outside realized results.

Verified final full-game winner scores settle results. Any losing leg loses a standard combo; all legs must win for a win. Ties and voids remain unresolved pending market rules. No synthetic live valuation or early cash-out. Published results are fetched on opening this view; no continuous scoreboard feed.

The new archive workflow uses contents/write to append public entries and pages/write to request a rebuild. No secrets or personal ledgers are used. Publication fails visibly if a concurrent main push prevents the archive commit; rerun the workflow after resolving.
