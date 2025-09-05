// Service Worker for GuerillaGenics Push Notifications
const CACHE_NAME = 'guerilla-genics-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🦍 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🦍 Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('🦍 Service Worker: Cache failed', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🦍 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🦍 Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push messages
self.addEventListener('push', (event) => {
  console.log('🦍 Service Worker: Push received', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'GuerillaGenics Alert', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || '🦍 GuerillaGenics Alert',
    body: data.body || 'New Juice Watch notification available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    image: data.image,
    data: {
      url: data.url || '/',
      playerId: data.playerId,
      alertType: data.alertType,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || 'juice-watch-alert'
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('🦍 Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  const { action, notification } = event;
  const { data } = notification;
  
  if (action === 'dismiss') {
    // Just close the notification
    return;
  }
  
  // Default action or 'view' action
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('🦍 Service Worker: Background sync', event.tag);
  
  if (event.tag === 'juice-watch-sync') {
    event.waitUntil(
      // Sync any pending alert data when back online
      fetch('/api/alerts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          type: 'background-sync'
        })
      }).catch((err) => {
        console.log('🦍 Service Worker: Sync failed', err);
      })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('🦍 Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});