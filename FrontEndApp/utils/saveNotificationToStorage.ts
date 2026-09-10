import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Dispatch, SetStateAction } from "react";

export const saveNotificationToStorage = async (
  notification: Notifications.Notification,
  setHasNewNotification: (hasNew: boolean) => void,
) => {
  console.log(
    "알림 전체 수신 데이터:",
    JSON.stringify(notification.request.content.data, null, 2),
  );
  try {
    const existingData = await AsyncStorage.getItem("zelontrip_notifications");
    const currentNotifications = existingData ? JSON.parse(existingData) : [];

    const newNotificationItem = {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      date: new Date().toISOString(),
      planId: notification.request.content.data?.planId || null,
    };

    await AsyncStorage.setItem(
      "zelontrip_notifications",
      JSON.stringify([newNotificationItem, ...currentNotifications]),
    );
    setHasNewNotification(true);
  } catch (error) {
    console.log("알림 저장 실패:", error);
  }
};
