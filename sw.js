const CACHE = 'ticket-app-v175';
const CORE = [
 '/src/ticket-idle-v174.js?v=174',
 '/src/ticket-version-v175.js?v=175',
 '/src/ticket-autobackup-v173.css?v=173', '/src/ticket-autobackup-v173.js?v=173',
 '/src/ticket-adjustments-v172.css?v=172', '/src/ticket-adjustments-v172.js?v=172',
 '/src/ticket-input-v171.js?v=171',
 '/src/ticket-adjustments-v170.css?v=171', '/src/ticket-adjustments-v170.js?v=171',
 '/src/ticket-unified-v169.css?v=171', '/src/ticket-unified-v169.js?v=171',
 '/src/ticket-restore-v168.css?v=168', '/src/ticket-restore-v168.js?v=168',
 '/public/config.js?v=168', '/src/ticket-cloud-v167.js?v=168',
 '/src/ticket-storage-v166.js?v=168',
 '/src/ticket-backup-v165.js?v=168', '/src/ticket-backup-v165.css?v=168',
'/src/ticket-daymarks-v164.css?v=168', '/src/ticket-daymarks-v164.js?v=168',
  '/src/ticket-bank-v163.js?v=168', '/src/ticket-bank-v163.css?v=168',
  '/src/ticket-navigation-v162.js?v=168', '/src/ticket-navigation-v162.css?v=168',
  '/src/ticket-records-v159.js?v=168', '/src/ticket-records-v159.css?v=168',
  '/', '/index.html', '/app.js?v=168', '/src/styles.css?v=168', '/src/mobile-auth.css?v=168', '/src/ticket-auth-v145.css?v=168', '/src/ticket-home-v150.css?v=168',
  '/src/settings-capture-v103.css?v=168', '/src/ticket-enhancements-v103.js?v=168', '/src/ticket-fixes-v104.css?v=168', '/src/ticket-fixes-v104.js?v=168',
  '/src/ticket-enhancements-v105.css?v=168', '/src/ticket-enhancements-v105.js?v=168', '/src/ticket-hotfix-v105.js?v=168',
  '/src/ticket-enhancements-v106.css?v=168', '/src/ticket-enhancements-v106.js?v=168', '/src/ticket-enhancements-v107.css?v=168', '/src/ticket-enhancements-v107.js?v=168',
  '/src/ticket-ai-v108.js?v=168', '/src/ticket-ai-v109.js?v=168', '/src/ticket-ai-v110.js?v=168', '/src/ticket-enhancements-v111.css?v=168', '/src/ticket-enhancements-v111.js?v=168', '/src/ticket-ai-v111.js?v=168',
  '/src/ticket-enhancements-v112.css?v=168', '/src/ticket-enhancements-v112.js?v=168', '/src/ticket-enhancements-v113.css?v=168', '/src/ticket-enhancements-v113.js?v=168',
  '/src/ticket-enhancements-v114.css?v=168', '/src/ticket-enhancements-v114.js?v=168', '/src/ticket-enhancements-v115.css?v=168', '/src/ticket-enhancements-v115.js?v=168',
  '/src/ticket-enhancements-v116.css?v=168', '/src/ticket-enhancements-v116.js?v=168', '/src/ticket-capture-v155.css?v=168', '/src/ticket-capture-v156.css?v=168',
 
  '/src/ticket-enhancements-v123.css?v=168', '/src/ticket-enhancements-v123.js?v=168',
  '/src/ticket-settings-v130.css?v=168', '/src/ticket-settings-v130.js?v=168', '/src/ticket-holidays-v132.css?v=168', '/src/ticket-holidays-v132.js?v=168', '/src/ticket-correction-v134.css?v=168', '/src/ticket-correction-v134.js?v=168',
  '/version.json', '/public/version.json', '/public/manifest.webmanifest?v=174', '/public/favicon.png?v=174', '/public/app-icon-v174.png?v=174', '/public/app-icon-v139.svg?v=171', '/public/app-icon-maskable-v139.svg?v=171', '/public/hand-dorsal-photoreal-v144.png?v=168', '/public/favicon.svg'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));return response;}).catch(async()=>await caches.match(event.request)||caches.match('/index.html')));});
