import { sendFeedback } from "@/api/feedback/sendFeedback";
import { ApiErrorResponse } from "@/types/ApiError";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useSendFeedback = (options?: {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) => {
  return useMutation({
    mutationFn: sendFeedback,
    onSuccess: () => {
      options?.onSuccess?.();
      alert("피드백이 성공적으로 접수되었습니다!");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errMsg =
        error.response?.data?.detail ||
        "피드백 전송에 실패했습니다. 다시 시도해 주세요.";
      options?.onError?.(errMsg);
      alert(errMsg);
    },
  });
};
