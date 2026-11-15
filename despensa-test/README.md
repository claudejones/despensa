# Despensa tests

`node <suite>.js` from this directory. Each exits non-zero on failure, so a
runner judges by **exit code** — several suites print the word "fail"
legitimately, and one's passing assertion is a deliberate `BUILD FAILED`. A
grep-based runner once reported a clean sweep over real failures.

Nothing here hardcodes a browser path. Playwright is asked where its own
Chromium is, because a hardcoded path is the same mistake as a hardcoded
total: it passed for months, then a new container moved Chromium from
`chromium-1194` to `-1243` and every suite died at once.

Nothing here hardcodes an item count, a price or a receipt figure either,
with one deliberate exception: `v426` knows the 14 Nov receipt total, so that
a sync patch which stops tying cannot reach a phone quietly.

## The suites

| file | what it holds in place |
|---|---|
| `run.js` | broad smoke — the app boots, every screen renders, no NaN |
| `currency.js` | each figure converted once, at its own trip's rate |
| `categories.js` | one denominator per row, One-offs, the drill-down, `S.catFix` surviving a rebuild |
| `quicktrips.js` | real money everywhere, never a basket average or a duplicate |
| `sheets.js` | the overlay contract — sticky title, close target, one picker at a time |
| `v425.js` | price history records only what was observed |
| `v426.js` | the catalogue and the sync patch, against the live build |
| `v427.js` | variant families group the list and hold no money |
| `v428.js` | fixed chrome keeps off the content |

The named files replace suites lost on 14 Nov. They are named for what they
test rather than for the version they shipped in, because a version number
stops meaning anything the moment the file it described is gone. New suites
should follow that.

## What is still uncovered

Honest list, so nobody mistakes nine green suites for complete coverage:
restock cadence and the three-purchase minimum, catalogue name resolution
(longest-prefix and reverse match), tab navigation and the back behaviour,
and the month-by-month chart's own rendering. Those were in the lost suites
and have not been rewritten yet.

## stale/

These test an app that no longer exists — `restock` was removed, the back
navigation changed, the fingerprint files moved. They are the only surviving
copies of suites lost when a working container was reclaimed, and they are
kept as a record of what was being checked, not as tests. **Do not run them
against the repo**: one of them deleted `sync/latest.json` on the run that
uncovered all this.

Mine them for intent when rewriting the gaps above, then delete what you have
replaced.
