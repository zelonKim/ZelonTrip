import { getUserProfile } from "@/api/user/getUserProfile";
import { useQuery } from "@tanstack/react-query";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getUserProfile,
  });
};