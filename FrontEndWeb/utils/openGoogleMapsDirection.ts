export const openGoogleMapsDirection = (
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
) => {
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=transit`;
  window.open(googleMapsUrl, "_blank");
};
