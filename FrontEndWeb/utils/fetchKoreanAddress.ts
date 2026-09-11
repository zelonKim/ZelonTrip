import { Dispatch, SetStateAction } from "react";

export const fetchKoreanAddress = (
  lat: number,
  lng: number,
  mapsLib: google.maps.MapsLibrary | null,
  setDisplayLocation: Dispatch<SetStateAction<string>>,
) => {

  if (!mapsLib || typeof google === "undefined" || !google.maps) {
    setDisplayLocation("위치 정보 가져오기 실패");
    return;
  }

  try {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng }, language: "ko" },

      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const fullAddress = results[0].formatted_address;
          const refinedAddress = fullAddress.replace("대한민국 ", "");
          setDisplayLocation(refinedAddress);
          
        } else {
          console.error("지오코딩 실패 상태 코드:", status);
          setDisplayLocation("서울, 대한민국");
        }
      },
    );
  } catch (e) {
    console.error("Geocoder 초기화 실패 시스템 예외:", e);
    setDisplayLocation("서울, 대한민국");
  }
};
