// Service Worker New Market - 2026
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// ESCUTA AS MENSAGENS PUSH DO FIREBASE
self.addEventListener('push', function(event) {
    let data = { title: 'New Market Alerta', body: 'Verifique as validades críticas!' };
    
    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/1162/1162250.png', 
        badge: 'https://cdn-icons-png.flaticon.com/512/1162/1162250.png',
        vibrate: [200, 100, 200, 100, 400],
        data: {
            url: self.location.origin
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ABRIR O APP AO CLICAR NA NOTIFICAÇÃO
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
