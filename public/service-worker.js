const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/index.js",
  '/db.js',
  "/icons/hand-icon-192x192.png",
  "/icons/hand-icon-512x512.png",
];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// // install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
    
  );
    
  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  // tell the browser to activate this service worker immediately once it has finished installing
  self.skipWaiting();
});


// Clears cache upon install
self.addEventListener("activate", function(evt) {
  const currentCaches = [PRECACHE, RUNTIME];
  evt.waitUntil( 
    caches.keys()
    .then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    })
    .then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  // Take over control of the frontend
  self.clients.claim();
});

// Fetches data from cache
self.addEventListener('fetch', event => {
  // Caches API request
  if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If response is good, clone it and store it in the cache
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // If networks request fails, retrieve from cache
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
  }

  // Serve static assets using offline-first approach
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request);
      })
  );
});