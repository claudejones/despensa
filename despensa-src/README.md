# Despensa sources

`python3 -I build.py` assembles these into `../index.html`, the single file
GitHub Pages serves. Nothing else needs running.

The build fails rather than warns on: an app that no longer reads the content
fingerprints, a versioned cache name creeping back into `sw.js`, the `/sync/`
carve-out going missing, and any malformed price-history entry.

`CAT_FP` and `SEED_FP` are hashes of `catalogue.js` and `seed-trips.js`,
injected at build time. Never bump a data version by hand — the hash is the
gate. A typed version number is the bug this replaced, twice.

These files were committed on 14 Nov. Until then they existed only in a
working container, and when one was reclaimed they had to be recovered by
splitting the deployed `index.html` back apart.
