export const saveNotificationToStorage = (planId: string | number, loc: string) => {
  try {
    const existingData = localStorage.getItem("zelontrip_notifications");
    const list = existingData ? JSON.parse(existingData) : [];
    const newNotification = {
      id: `noti_${Date.now()}`,
      title: "생성 완료",
      body: `${loc} 여행 플랜이 생성되었습니다`,
      date: new Date().toISOString(),
      planId,
    };
    localStorage.setItem(
      "zelontrip_notifications",
      JSON.stringify([newNotification, ...list]),
    );
  } catch (e) {
    console.error("로컬 스토리지 알림 저장 실패:", e);
  }
};
