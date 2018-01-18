var staticCacheName = 'psea-static-v2';
var urlsToCache = [
'/profiles',
'/views/CBS/profiles/list/view',
'/views/CBS/profiles/recentprofile/view',
'/assets/nextgen/stylesheets/application.css?version=20180115043404',
'/assets/nextgen/stylesheets/cbsCustom.css?version=20180115043404',
'/assets/test.js?version=20180115043404',
'/assets/application.js?version=20180115043404',
'/assets/lib/nextgen/app.js?version=20180115043404',
'/assets/base/include.js?version=20180115043404',
'/assets/security/include.js?version=20180115043404',
'/assets/shared/include.js?version=20180115043404',
'/assets/CBS/include.js?version=20180115043404'];


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
          return caches.open('psea-static-v1').then(function(cache){
            cache.add(event.request.url);
            return response;
          })
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


//sd