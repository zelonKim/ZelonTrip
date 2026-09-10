import { client } from "../client";
import { SendNotificationPayload } from "../../types/SendNotification";

export const requestSuccessNotification = async ({
  pushToken,
  deviceId,
  planId,
  location,
}: SendNotificationPayload) => {
  try {
    await client.post("/v1/notification", {
      pushToken,
      deviceId,
      planId: planId ? String(planId) : null,
      contents: {
        title: "생성 완료",
        body: `${location} 여행 플랜이 생성되었습니다`,
        message: "AI가 생성한 여행 플랜을 보완할 수도 있어요.",
      },
    });
  } catch (err: any) {
    console.log("=== 푸시 알림 요청 실패 상세 로그 ===");
    if (err.response) {
      console.log("상태 코드:", err.response.status);
      console.log(
        "서버 상세 에러",
        JSON.stringify(err.response.data, null, 2),
      );
    } else if (err.request) {
      console.log("요청 전송 성공했으나 응답 없음:", err.request);
    } else {
      console.log("에러 메시지:", err.message);
    }
    console.log("전체 에러 오브젝트:", err.config);
    console.log("=======================================");
    throw err;
  }
};
