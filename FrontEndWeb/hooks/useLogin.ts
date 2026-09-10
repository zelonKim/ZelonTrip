import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginApi } from "@/api/auth/loginApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { setSecureItem } from "@/utils/secureLs";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      if (data?.access_token) {
        setSecureItem("userToken", data.access_token);
        router.replace("/");
      } else {
        alert("안내: 토큰을 받아오지 못했습니다.");
      }
    },
    onError: (error: unknown) => {
      const errorMsg = getErrorMessage(error, "로그인 중 에러가 발생했습니다.");
      alert(`안내: ${errorMsg}`);
    },
  });
};
