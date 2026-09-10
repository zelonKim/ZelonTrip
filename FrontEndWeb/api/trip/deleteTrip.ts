import { client } from "../client";
import { DeleteTripResponse } from "@/types/DeleteTrip";

export const deleteTrip = async (
  tripId: number,
): Promise<DeleteTripResponse> => {
  const response = await client.delete<DeleteTripResponse>(
    `/v1/trip/${tripId}`,
  );
  return response.data;
};
