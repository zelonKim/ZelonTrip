import { getUserTripStats } from "@/api/user/getUserTripStats";
import { useQuery } from "@tanstack/react-query";

export const useUserTripStats = () => {
  return useQuery({
    queryKey: ["userTripStats"],
    queryFn: getUserTripStats,
  });
};