import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { deactivateUser } from "@/api/user/deactivateUser";
import { ApiErrorResponse } from "@/types/ApiError";
import { useRouter } from "next/navigation";
import { removeSecureItem } from "@/utils/secureLs";

export const useDeactivateUser = (options?: {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: async () => {
      removeSecureItem("userToken");
      queryClient.clear();
      options?.onSuccess?.();
      alert("그동안 서비스를 이용해 주셔서 감사합니다.");
      router.replace("/(auth)/login");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errMsg =
        error.response?.data?.detail || "서버 통신에 실패했습니다.";
      options?.onError?.(errMsg);
      alert(errMsg);
    },
  });
};
