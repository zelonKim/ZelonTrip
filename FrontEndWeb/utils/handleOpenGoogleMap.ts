import { Coordinates } from "@/types/Coordinates";

export const handleOpenGoogleMap = (coords: Coordinates | null) => {
  if (!coords?.latitude || !coords?.longitude) {
    alert("현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.");
    return;
  }
  const { latitude, longitude } = coords;
  const googleMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  window.open(googleMapUrl, "_blank");
};
