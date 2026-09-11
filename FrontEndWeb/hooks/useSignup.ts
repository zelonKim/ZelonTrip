import { signupApi } from "@/api/auth/signupApi";
import { ApiErrorResponse } from "@/types/ApiError";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation"; 

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      window.alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      router.push("/login");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMsg =
        error.response?.data?.detail || "회원가입에 실패했습니다.";
      window.alert(errorMsg);
    },
  });
};
