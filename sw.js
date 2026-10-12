/* Despensa — offline cache.

   This file has no version in it and never needs to change. Upload it once.

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
