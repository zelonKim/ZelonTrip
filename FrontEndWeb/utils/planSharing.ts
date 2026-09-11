import { TripDetailResponse } from "@/types/TripDetail";

export const planSharing = async (planData: TripDetailResponse) => {
  if (!planData) return;

  const shareMessage = `✈️ [${planData.location}] 여행 일정을 공유합니다!\n\n📌 제목: ${planData.title}\n📝 개요: ${planData.overview}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${planData.location} 여행 일정`,
        text: `${shareMessage}\n\n🔗 일정 링크:\n${window.location.href}`,
      });
    } catch (err) {
      console.log("공유 취소 또는 에러", err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(
        `${shareMessage}\n\n👇 링크 확인하기\n${window.location.href}`,
      );
      alert(
        "여행 일정 정보와 주소가 클립보드에 복사되었습니다! 편하게 공유해 보세요.",
      );
    } catch {
      alert("공유하기를 지원하지 않는 브라우저입니다.");
    }
  }
};
