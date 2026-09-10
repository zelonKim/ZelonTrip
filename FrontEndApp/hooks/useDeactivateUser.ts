import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { AxiosError } from "axios";
import { Alert } from "react-native";
import { router } from "expo-router";
import { deactivateUser } from "@/api/user/deactivateUser";
import { ApiErrorResponse } from "@/types/ApiError";


export const useDeactivateUser = (options?: {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: async () => {
      await SecureStore.deleteItemAsync("userToken");
      queryClient.clear();
      options?.onSuccess?.();
      Alert.alert("안내", "그동안 서비스를 이용해 주셔서 감사합니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errMsg =
        error.response?.data?.detail || "서버 통신에 실패했습니다.";
      options?.onError?.(errMsg);
      Alert.alert("탈퇴 실패", errMsg);
    },
  });
};
