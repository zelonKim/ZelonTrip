// src/services/notifications.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBatCTtVHm5t3arjCOK0Q9JLUcOiXIce_g",
  authDomain: "zelontrip.firebaseapp.com",
  projectId: "zelontrip",
  storageBucket: "zelontrip.firebasestorage.app",
  messagingSenderId: "886050965318",
  appId: "1:886050965318:web:cf50d80dda72a3719f0747",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const messaging =
  typeof window !== "undefined" ? getMessaging(app) : null;

export async function registerForWebPushNotificationsAsync() {
  if (typeof window === "undefined" || !messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("푸시 알림 권한이 거부되었습니다.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error("웹 푸시 토큰 발급 실패:", error);
    return null;
  }
}
