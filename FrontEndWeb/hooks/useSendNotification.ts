import { client } from "@/api/client";
import { saveNotificationToStorage } from "@/utils/saveNotificationToStorage";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useTripNotification = (pushToken: string | null) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      planId,
      location,
    }: {
      planId: number | string;
      location: string;
    }) => {
      if (!pushToken) throw new Error("준비된 웹 푸시 토큰이 없습니다.");

      await client.post("/v1/notification", {
        pushToken,
        deviceId: "WEB_BROWSER_SESSION",
        contents: {
          title: "생성 완료",
          body: `${location} 여행 일정이 생성되었습니다.`,
          message: "AI가 생성한 여행 플랜을 보완할 수도 있어요.",
        },
        data: { planId },
      });
      return { planId, location };
    },
    onSuccess: ({ planId, location }) => {
      saveNotificationToStorage(planId, location);
      setTimeout(() => {
        if (confirm("🚀 생성된 여행 일정을 바로 확인하러 가시겠습니까?")) {
          router.push(`/plan/${planId}`);
        }
      }, 1000);
    },
    onError: (err) => {
      console.error("푸시 알림 백엔드 요청 실패:", err);
    },
  });
};
