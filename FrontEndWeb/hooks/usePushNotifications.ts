import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Linking } from "react-native";
import { registerPushNotifications } from "@/utils/registerPushNotifications";
import { getDeviceId } from "@/utils/getDeviceId";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [cachedPushToken, setCachedPushToken] = useState<string | null>(null);
  const [cachedDeviceId, setCachedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const prepareNotificationTokens = async () => {
      try {
        const token = await registerPushNotifications();
        const deviceId = await getDeviceId();
        if (token) setCachedPushToken(token);
        if (deviceId) setCachedDeviceId(deviceId);
      } catch (error) {
        console.log("초기 토큰 준비 실패:", error);
      }
    };

    prepareNotificationTokens();

    const notificationsListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("알림 수신:", notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("알림 클릭:", response);
        const planId = response.notification.request.content.data?.planId;
        if (planId) {
          Linking.openURL(`zelontrip://plan/${planId}`);
        }
      });

    return () => {
      notificationsListener.remove();
      responseListener.remove();
    };
  }, []);

  return { cachedPushToken, cachedDeviceId };
};
