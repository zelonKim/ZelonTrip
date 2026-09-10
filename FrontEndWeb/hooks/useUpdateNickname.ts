import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UserProfileResponse } from "@/types/UserProfile";
import { ApiErrorResponse } from "@/types/ApiError";
import { updateNickname } from "@/api/user/updateNickname";
import { Alert } from "react-native";

export const useUpdateNickname = (options?: {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNickname,
    onSuccess: (data) => {
      queryClient.setQueryData<UserProfileResponse>(
        ["currentUserProfile"],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            nickname: data.nickname,
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      options?.onSuccess?.();
      Alert.alert("성공", "닉네임이 성공적으로 설정되었습니다.");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errMsg =
        error.response?.data?.detail || "닉네임 저장에 실패했습니다.";
      options?.onError?.(errMsg);
      Alert.alert("오류", errMsg);
    },
  });
};
