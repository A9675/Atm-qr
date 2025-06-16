self.addEventListener('push', function(e) {
  const data = e.data.json();
  const options = {
    body: data.body,
    icon: 'icon.png',
    data: { url: data.url }
  };
  e.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
