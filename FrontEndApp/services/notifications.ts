import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

function handleRegistrationError(errorMessage: string) {
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError("푸시 알림 권한이 승인되어야만 합니다.");
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      handleRegistrationError("프로젝트 아이디를 찾을 수 없습니다.");
    }

    try {
      const pushTokenString = (await Notifications.getDevicePushTokenAsync())
        .data;
      console.log("푸시 토큰 스트링", pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(e as string);
    }
  } else {
    handleRegistrationError(
      "푸시 알림을 위해서는 실제 기기를 사용해야 합니다.",
    );
  }
}
