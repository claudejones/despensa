/* Despensa — offline cache.

   This file has no version in it. It changes only when the caching strategy
   itself changes, which has happened once: sync/ was carved out in 4.12.0.

   Why that is safe: the strategy below is network-first. Every time the phone
   loads the app with a signal, the fresh index.html is fetched and written
   over whatever was cached. The cache name only ever mattered for throwing
   old copies away, and with a single fixed name there is nothing to throw
   away — the one entry is replaced in place. A version here only ever cost
   a second file to upload on every release.

   The activate step still sweeps up the old despensa-x.y.z caches from
   before this change, so the first load after upgrading cleans itself. */
var CACHE = "despensa";
var ASSETS = ["./", "./index.html"];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        /* every previously versioned cache, and anything else stale */
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Network first, cache as fallback: the newest build wins whenever there is
   a signal, and the last good one still opens in a dead spot at the store. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  /* The reconciliation patch under sync/ is never cached and never faked.
     Without this carve-out two things go wrong: an applied patch lingers in
     the cache for ever, and — worse — the offline fallback below answers a
     missing sync file with index.html, handing the app a page of HTML where
     it expects JSON. Let it fail honestly instead. The app treats every
     failure as "no sync" and carries on, so an older service worker still
     registered on a phone cannot break anything either. */
  if(e.request.url.indexOf("/sync/") >= 0) return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
