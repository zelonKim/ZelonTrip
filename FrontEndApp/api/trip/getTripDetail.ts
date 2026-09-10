import { client } from "../client";
import { TripDetailResponse } from "../../types/TripDetail";

export const getTripDetail = async (
  tripId: string,
): Promise<TripDetailResponse> => {
  const res = await client.get(`/v1/trip/${tripId}`);
  return res.data;
};
