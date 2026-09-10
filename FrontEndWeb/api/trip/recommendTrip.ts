import { DEFAULT_COORDS } from "@/constants/defaultCoords";
import { client } from "../client";
import { RecommendTripParams } from "@/types/RecommendTripParams";



export const recommendTrip = async ({
  hasHistory,
  coords,
}: RecommendTripParams) => {
  if (hasHistory) {
    const response = await client.get("/v1/trip/recommend/history");
    return response.data;
  }

  const response = await client.get("/v1/trip/recommend/nearby", {
    params: {
      latitude: coords?.latitude ?? DEFAULT_COORDS.latitude,
      longitude: coords?.longitude ?? DEFAULT_COORDS.longitude,
    },
  });

  return response.data;
};