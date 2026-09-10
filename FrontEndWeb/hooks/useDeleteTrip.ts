import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { deleteTrip } from "@/api/trip/deleteTrip";

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      Alert.alert("삭제 완료", "여행 일정이 성공적으로 삭제되었습니다.");
      router.replace("/(tabs)/plans");
    },
    onError: () => {
      Alert.alert("삭제 실패", "삭제 중 오류가 발생했습니다.");
    },
  });
};
