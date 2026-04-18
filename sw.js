const CACHE = 'familialopbas-v5';
const ASSETS = ['.', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBpw-IXMNsthOUfwNzugMeiNNLT-TndaAM",
  authDomain: "familialopbas.firebaseapp.com",
  projectId: "familialopbas",
  storageBucket: "familialopbas.firebasestorage.app",
  messagingSenderId: "152258815775",
  appId: "1:152258815775:web:f3d530d07d43113647b22a"
});
const messaging = firebase.messaging();

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
        return fetch(e.request)
          .then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
          .catch(() => cached);
      }
      return cached || fetch(e.request);
    })
  );
});

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'FamiliaLopBas', {
    body: body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: payload.data?.tag || 'flb-notif',
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const client of list) {
        if(client.url.includes('familiaLopBas') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});
