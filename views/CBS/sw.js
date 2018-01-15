self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('psea-static-v1').then(function(cache) {
        return cache.addAll([
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
          '/assets/CBS/include.js?version=20180115043404'
        ]);
      })
    );
  });

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


  // function fetchResourcesFromCache(response) {
  //   if(response) return response;
  //   else fetchResourcesAndSaveToCache(request);
  // }

  // function fetchResourcesAndSaveToCache(request) {
  //   fetch(request).then()
  // }

  // function saveResourcesToCache() {

  // }

  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //     caches.match(event.request).then(fetchResourcesFromCache)
  //   );

