import { client } from "../client";
import { RegenerateTripResponse } from "../../types/RegenerateTrip";

export const regenerateTrip = async ({
  tripId,
  feedback,
}: {
  tripId: string | string[] | number;
  feedback: string;
}): Promise<RegenerateTripResponse> => {
  const res = await client.post(`/v1/trip/${tripId}/regenerate`, {
    feedback,
  });
  return res.data;
};
