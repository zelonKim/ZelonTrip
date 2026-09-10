import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";

const DEFAULT_LOCATION = {
  displayLocation: "서울, 대한민국",
  coords: { latitude: 37.5665, longitude: 126.978 },
};

export const useUserLocation = () => {
  const [displayLocation, setDisplayLocation] = useState("위치 탐색 중...");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const getUserLocation = useCallback(async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setDisplayLocation(DEFAULT_LOCATION.displayLocation);
        setCoords(DEFAULT_LOCATION.coords);
        Alert.alert(
          "위치 권한 거부",
          "현재 위치 기준 서비스를 이용하시려면 설정에서 위치 권한을 허용해 주세요.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      setCoords({ latitude, longitude });

      const reverseRegion = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseRegion && reverseRegion.length > 0) {
        const address = reverseRegion[0];
        const cityName = address.city || address.region || "";
        const districtName = address.district || "";
        const formattedAddress = `${cityName} ${districtName}`.trim();

        setDisplayLocation(formattedAddress || "대한민국");
      } else {
        setDisplayLocation("위치 알 수 없음");
      }
    } catch (error) {
      setDisplayLocation(DEFAULT_LOCATION.displayLocation);
      setCoords(DEFAULT_LOCATION.coords);
    } finally {
      setIsLocationLoading(false);
    }
  }, []);

  return {
    displayLocation,
    coords,
    isLocationLoading,
    getUserLocation,
  };
};
