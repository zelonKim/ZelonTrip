import { UserProfileResponse } from "@/types/UserProfile";
import { client } from "../client";

export const updateNickname = async (nickname: string) => {
  const response = await client.patch<UserProfileResponse>(
    "/v1/user/nickname",
    {
      nickname,
    },
  );
  return response.data;
};
