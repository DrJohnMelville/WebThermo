var CACHE_NAME = 'webThermo-cache-v1';
var urlsToCache = [
    'WebThermo/Images/icon.svg',
    'WebThermo/Images/icon-192.png',
    'WebThermo/Images/icon-512.png',
    'WebThermo/alarm.mp3',
    'WebThermo/Thermo.js',
    'WebThermo/index.html',
    'WebThermo/manifest.json',
    'WebThermo/ServiceWorker.js',
    'WebThermo/Thermo.css',
    'WebThermo/package.json'
];

console.log('loading sw');

self.addEventListener('install', function(event) {
    // Perform install steps
    console.log('installing sw');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                var x = cache.addAll(urlsToCache);
                console.log('cache added');
                return x;
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                }
            )
    );
});