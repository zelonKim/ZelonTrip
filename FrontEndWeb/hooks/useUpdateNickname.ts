import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfileResponse } from "@/types/UserProfile";
import { updateNickname } from "@/api/user/updateNickname";

const updateNicknameTexts = {
  ko: {
    successAlert: "닉네임이 성공적으로 설정되었습니다.",
    defaultError: "닉네임 저장에 실패했습니다.",
  },
  en: {
    successAlert: "Nickname has been updated successfully.",
    defaultError: "Failed to update nickname.",
  },
} as const;

const getLocale = (): keyof typeof updateNicknameTexts => {
  if (typeof window === "undefined") return "ko";
  const browserLang =
    navigator.language || (navigator.languages && navigator.languages[0]);
  return browserLang && !browserLang.toLowerCase().startsWith("ko")
    ? "en"
    : "ko";
};

export const useUpdateNickname = (options?: {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNickname,
    onSuccess: (data) => {
      const locale = getLocale();
      const t = updateNicknameTexts[locale];

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

      alert(t.successAlert);
    },
    onError: () => {
      const locale = getLocale();
      const t = updateNicknameTexts[locale];

      const errMsg = t.defaultError;
      options?.onError?.(errMsg);

      alert(errMsg);
    },
  });
};
