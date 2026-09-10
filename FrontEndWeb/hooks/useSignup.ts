import { signupApi } from "@/api/auth/signupApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      Alert.alert(
        "환영합니다 🤗",
        "회원가입이 완료되었습니다. 로그인해주세요.",
        [
          {
            text: "확인",
            onPress: () => router.push("/(auth)/login"),
          },
        ],
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "회원가입에 실패했습니다.";
      Alert.alert("안내", errorMsg);
    },
  });
};
