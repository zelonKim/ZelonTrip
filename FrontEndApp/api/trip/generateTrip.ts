import { client } from "../client";
import {
  TripGenerateRequest,
  TripGenerateResponse,
} from "../../types/TripGenerate";

export const generateTrip = async (
  requestData: TripGenerateRequest,
): Promise<TripGenerateResponse> => {
  const response = await client.post<TripGenerateResponse>(
    "/v1/trip/generate",
    requestData,
  );
  return response.data;
};
