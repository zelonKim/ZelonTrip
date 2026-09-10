import { UserProfileResponse } from "@/types/UserProfile";
import { client } from "../client";

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const response = await client.get("/v1/auth/me");
  return response.data;
};
