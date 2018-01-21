var staticCacheName = 'psea-static-v2';
var version = 20180121;
var urlsToCache = [
'/profiles',
'/views/CBS/profiles/list/view',
'/views/CBS/profiles/recentprofile/view',
'/assets/nextgen/stylesheets/application.css?version=' + version,
'/assets/nextgen/stylesheets/cbsCustom.css?version=' + version,
'/assets/test.js?version=' + version,
'/assets/application.js?version=' + version,
'/assets/lib/nextgen/app.js?version=' + version,
'/assets/base/include.js?version=' + version,
'/assets/security/include.js?version=' + version,
'/assets/shared/include.js?version=' + version,
'/assets/CBS/include.js?version=' + version];

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('psea-') && cacheName != staticCacheName;
        }).map(function(cacheName){
          return caches.delete(cacheName);
        })
      )
    })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request).then(function(response) {
      if(response) {
        return response;
      } else {
          return fetch(event.request).then(function(response){
            return caches.open(staticCacheName).then(function(cache){    
              return cache.put(event.request, response.clone()).then(function() {
                return response;
              })
            })
        }).catch(function(er){
          console.log(er);
        })
      } 
    })
  );
});

self.addEventListener('message',function(event) {
  if(event.data.action == 'skipWaiting') {
    self.skipWaiting();
  }
})

