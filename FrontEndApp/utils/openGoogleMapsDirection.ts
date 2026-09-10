import { Alert, Linking } from "react-native";

export const openGoogleMapsDirection = async (
  startLat: number | null,
  startLng: number | null,
  destLat: number,
  destLng: number,
) => {
  const origin = startLat && startLng ? `${startLat},${startLng}` : "";
  const destination = `${destLat},${destLng}`;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;

  try {
    const isSupported = await Linking.canOpenURL(googleMapsUrl);
    if (isSupported) {
      await Linking.openURL(googleMapsUrl);
    } else {
      Alert.alert("안내", "구글 맵 링크를 열 수 없습니다.");
    }
  } catch (error) {
    Alert.alert("안내", "지도 앱이나 브라우저를 열 수 없습니다.");
  }
};
