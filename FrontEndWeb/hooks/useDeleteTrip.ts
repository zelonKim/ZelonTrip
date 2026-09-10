import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { deleteTrip } from "@/api/trip/deleteTrip";

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      alert("여행 일정이 성공적으로 삭제되었습니다.");
      router.replace("/(tabs)/plans");
    },
    onError: () => {
      alert("삭제 중 오류가 발생했습니다.");
    },
  });
};
