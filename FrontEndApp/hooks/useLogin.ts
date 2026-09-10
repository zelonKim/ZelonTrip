import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { loginApi } from "../api/auth/loginApi";

interface UseLoginOptions {
  checkAuthStatus: () => Promise<void> | void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      const { access_token } = data;

      if (access_token) {
        await SecureStore.setItemAsync("userToken", access_token);

        if (options?.checkAuthStatus) {
          await options.checkAuthStatus();
        }

        router.replace("/(tabs)");
      } else {
        Alert.alert("안내", "토큰을 받아오지 못했습니다.");
      }
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "로그인 중 에러가 발생했습니다.";
      Alert.alert("안내", errorMsg);
    },
  });
};
