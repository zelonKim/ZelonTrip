// public/firebase-messaging-sw.js
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
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[서비스 워커] 백그라운드 푸시 수신:", payload);

  if (payload.notification) {
    const notificationTitle = payload.notification.title || "ZelonTrip 알림 🎉";
    const notificationOptions = {
      body: payload.notification.body || "새로운 알림이 도착했습니다.",
      icon: "/favicon.ico",
      data: payload.data || {},
    };

    // 🎯 서비스 워커는 본연의 역할인 '알림창 띄우기'만 전담합니다.
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

// 🎯 [알림 클릭 이벤트 핸들러]: 기존 로직 유지 및 가드 강화
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // payload.data로 토스했던 객체 안에서 planId를 안전하게 꺼냅니다.
  const planId = event.notification.data?.planId;

  if (planId) {
    const targetUrl = `/plan/${planId}`;
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // 이미 해당 플랜 페이지가 켜져 있는 탭이 있다면 그리로 포커스 이동
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url.includes(targetUrl) && "focus" in client) {
              return client.focus();
            }
          }
          // 켜져 있는 탭이 없다면 새 창/새 탭으로 라우팅 링크 오픈
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        }),
    );
  }
});
