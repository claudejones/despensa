# Architecture and boundaries

## Three separate stores
1. Published weekly football research: versioned public JSON, immutable historical pre-kickoff predictions and research snapshots.
2. Personal Kalshi ledger: local device storage, export/import; never committed to public GitHub automatically.
3. Calculation engine: deterministic, independently tested math; never treats historical win rates as proof of an edge.

## Weekly publication
ChatGPT scheduled task orchestrates research -> probability assessment -> combo generation -> schema validation -> GitHub commit -> GitHub Pages HTTP retrieval -> app-load verification -> receipt. Fail closed; preserve last valid JSON and report errors. Do not claim unattended GitHub writes work until an actual scheduled run verifies them.

## Weekly JSON contract
Season, week, researchVersion, researchedAt, source list, games with unique IDs, team names/records, kickoff ISO timestamps, categorized summary+bullet detail, injury provenance, predictions with frozenAt and uncertainty, and combo candidates referencing game IDs and sides. Missing or stale values must be null and flagged, never invented.

## Application UX
Week navigation, Games, AI Picks, Combos, Kalshi, Dashboard. Accordion summary when closed, details when expanded. Every plan's payout sheet directly after its tickets. Draft candidates visually separate from validated priced plans. Exact dates for cross-day combos. Personal user-entered prices persist across research refreshes.

## Historical learning
Previous-week final scores and frozen predictions feed calibration reports; never rewrite earlier predictions after outcome. Private trade history enters only via explicit user-provided export and validation.
