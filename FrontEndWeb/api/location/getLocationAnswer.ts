import { client } from "../client";
import { LocationAnswerResponse } from "../../types/LocationAnswer";

export const getLocationAnswer = async (
  keyword: string | null,
): Promise<LocationAnswerResponse> => {
  const response = await client.post<LocationAnswerResponse>(
    "/v1/location/ask",
    { keyword },
  );
  return response.data;
};
