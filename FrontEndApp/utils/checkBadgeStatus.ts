import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkBadgeStatus = async (
  setHasNewNotification: (hasNew: boolean) => void
) => {
  const existingData = await AsyncStorage.getItem("zelontrip_notifications");
  if (existingData) {
    const list = JSON.parse(existingData);
    if (list.length > 0) setHasNewNotification(true);
  }
};