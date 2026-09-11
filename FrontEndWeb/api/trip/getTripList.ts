import { TripListResponse } from "@/types/TripList";
import { client } from "../client";

export const getTripList = async (): Promise<TripListResponse> => {
  const response = await client.get("/v1/trip/list");
  return response.data;
};
