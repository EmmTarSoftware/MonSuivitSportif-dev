// Récupère le chemin complet 

// recupère l'URL du script du service worker
const serviceWorkerUrl = self.location.href;
// Extrait le chemin avant "service-worker.js"
const basePath = serviceWorkerUrl.replace(/service-worker\.js$/, '');


console.log("BasePath = " + basePath);

console.log(`[ SERVICE WORKER ]  : Lancement du js`);
const PREFIX = "V4";//Numero de version
const CACHED_FILES = [`${basePath}Icons/Icon-No-Network.png`];


self.addEventListener('install',(event)=>{
  self.skipWaiting();//permet le remplacement du service worker dès que le nouveau existe
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PREFIX);
      await Promise.all(
        [...CACHED_FILES,'offline.html'].map((path)=>{
          return cache.add(new Request(path));
        })
      );
    })()
  );
  console.log(`[ SERVICE WORKER ] :  ${PREFIX} Install`);
});


self.addEventListener('activate', (event) => {
  clients.claim();// Permet de controler tout de suite la page

  // Suppression des anciennes clé de caches
  event.waitUntil(
    (async()=>{
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) =>{
          if (!key.includes(PREFIX)) {
            return caches.delete(key);
          }
        })
      );
    })()
  );


  console.log(`[ SERVICE WORKER ]  : ${PREFIX} Active`);
});




self.addEventListener('fetch', (event) => {
  // console.log(`Service worker mode : ${PREFIX} Fetching : ${event.request.url}, Mode : ${event.request.mode}`);
  if (event.request.mode === 'navigate'){
    event.respondWith(
      (async () => {

        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse){
            return preloadResponse;
          }
  
          return await fetch(event.request);
        } catch (e) {
          const cache = await caches.open(PREFIX);
          return await cache.match('offline.html');
        }
      })()
    );
  } else if (CACHED_FILES.includes(event.request.url)){
    event.respondWith(caches.match(event.request));
  }
});