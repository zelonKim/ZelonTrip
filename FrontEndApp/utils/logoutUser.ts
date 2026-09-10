import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

export const logoutUser = async () => {
  const queryClient = useQueryClient();

  try {
    await SecureStore.deleteItemAsync("userToken");
    queryClient.clear();
    router.replace("/(auth)/login");
  } catch (error) {
    Alert.alert("안내", "로그아웃 처리 중 오류가 발생했습니다.");
  }
};
