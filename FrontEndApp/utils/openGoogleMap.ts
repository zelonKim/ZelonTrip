import { Coordinates } from "@/types/Coordinates";
import { Alert, Linking } from "react-native";

export const openGoogleMap = async (coords: Coordinates | null) => {
  if (!coords?.latitude || !coords?.longitude) {
    Alert.alert(
      "안내",
      "현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.",
    );
    return;
  }

  const { latitude, longitude } = coords;

  const googleMapUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;

  try {
    await Linking.openURL(googleMapUrl);
  } catch (error) {
    Alert.alert("에러", "구글 맵을 여는 중 문제가 발생했습니다.");
  }
};
