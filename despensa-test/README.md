# Despensa tests

`node <suite>.js` from this directory. Each exits non-zero on failure, so a
runner judges by **exit code** — several suites print the word "fail"
legitimately, and one's passing assertion is a deliberate `BUILD FAILED`.

Nothing here hardcodes a browser path. Playwright is asked where its own
Chromium is, because a hardcoded path is the same mistake as a hardcoded
total: it passed for months, then a new container moved Chromium and every
suite died at once.

## stale/

These test an app that no longer exists — `restock` was removed, the back
navigation changed, the fingerprint files moved. They are the only surviving
copies of suites that were lost when a working container was reclaimed on
14 Nov, and they are kept as a record of what was being checked, not as
tests. **Do not run them against the repo**: one of them deleted
`sync/latest.json` on the run that uncovered all this.

Rewrite them into current suites as time allows, then delete the copy here.
