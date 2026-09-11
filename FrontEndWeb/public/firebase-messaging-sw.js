importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyBatCTtVHm5t3arjCOK0Q9JLUcOiXIce_g",
  authDomain: "zelontrip.firebaseapp.com",
  projectId: "zelontrip",
  storageBucket: "zelontrip.firebasestorage.app",
  messagingSenderId: "886050965318",
  appId: "1:886050965318:web:cf50d80dda72a3719f0747",
};

firebase.initializeApp(firebaseConfig);

//////////////////////////////////////////////////////

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("백그라운드 푸시 수신:", payload);

  if (payload.notification) {
    const notificationTitle = payload.notification.title || "ZelonTrip 알림 🎉";
    const notificationOptions = {
      body: payload.notification.body || "새로운 알림이 도착했습니다.",
      icon: "/favicon.ico",
      data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

//////////////////////////////////////////////////////

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const planId = event.notification.data?.planId;

  if (planId) {
    const targetUrl = `/plan/${planId}`;
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url.includes(targetUrl) && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        }),
    );
  }
});
