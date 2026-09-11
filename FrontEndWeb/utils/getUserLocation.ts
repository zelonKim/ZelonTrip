import { Dispatch, SetStateAction } from "react";
import { fetchKoreanAddress } from "./fetchKoreanAddress";
import { Coordinates } from "@/types/Coordinates";

export const getUserLocation = (
  setIsLocationLoading: Dispatch<SetStateAction<boolean>>,
  setDisplayLocation: Dispatch<SetStateAction<string>>,
  setCoords: Dispatch<SetStateAction<Coordinates | null>>,
  mapsLib: google.maps.MapsLibrary | null,
) => {
  setIsLocationLoading(true);
  if (!navigator.geolocation) {
    setDisplayLocation("서울, 대한민국");
    setCoords({ latitude: 37.5665, longitude: 126.978 });
    setIsLocationLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setCoords({ latitude, longitude });

      if (mapsLib) {
        fetchKoreanAddress(latitude, longitude, mapsLib, setDisplayLocation);
      } else {
        setDisplayLocation("위치 정보 가져오는 중...");
      }
      setIsLocationLoading(false);
    },
    (error) => {
      console.error("위치 획득 실패:", error);
      setDisplayLocation("서울, 대한민국");
      setCoords({ latitude: 37.5665, longitude: 126.978 });
      setIsLocationLoading(false);
    },
    { enableHighAccuracy: true, timeout: 7000 },
  );
};
