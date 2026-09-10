import { UserTripStatsResponse } from "@/types/UserTripStats";
import { client } from "../client";

export const getUserTripStats = async (): Promise<UserTripStatsResponse> => {
  const response = await client.get("/v1/user/stats");
  return response.data;
};