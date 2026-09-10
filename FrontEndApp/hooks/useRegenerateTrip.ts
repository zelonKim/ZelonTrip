import { regenerateTrip } from "@/api/trip/regenerateTrip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

interface UseRegenerateTripOptions {
  onSuccessCallback?: () => void;
}

export const useRegenerateTrip = (options?: UseRegenerateTripOptions) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: regenerateTrip,
    onSuccess: (_, variables) => {
      const { tripId } = variables;

      queryClient.invalidateQueries({ queryKey: ["tripDetail", tripId] });
      queryClient.invalidateQueries({ queryKey: ["tripList"] });

      options?.onSuccessCallback?.();

      Alert.alert("보완 완료 ✨", "AI가 일정을 보완하였습니다!");
      router.push({
        pathname: "/(tabs)/plan/[id]",
        params: { id: tripId },
      });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.detail || "일정 보완 중 오류가 발생했습니다.";
      Alert.alert("에러", errorMsg);
    },
  });
};
