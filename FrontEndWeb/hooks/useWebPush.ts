import { useState, useEffect } from "react";
import { onMessage } from "firebase/messaging";
import {
  registerForWebPushNotificationsAsync,
  messaging,
} from "@/services/notifications";


export const useWebPush = () => {
  const [cachedPushToken, setCachedPushToken] = useState<string | null>(null);

  useEffect(() => {
    const initWebPush = async () => {
      const token = await registerForWebPushNotificationsAsync();
      if (token) {
        setCachedPushToken(token);
      }
    };
    initWebPush();

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("포그라운드 알림 수신:", payload);
        alert(`[${payload.notification?.title}] ${payload.notification?.body}`);
      });
      return () => unsubscribe();
    }
  }, []);

  return { cachedPushToken };
};
