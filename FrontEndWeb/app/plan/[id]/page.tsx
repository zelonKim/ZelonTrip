"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  ChevronLeft,
  Share2,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Navigation,
  MapPin,
} from "lucide-react";
import { client } from "@/api/client";
import GoogleMapSection from "./GoogleMapSection";
import { useTheme } from "@/context/ThemeContext"; // 🎯 1. 전역 테마 훅 가져오기

const dayColors = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

export default function GeneratedPlanPage() {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme(); // 🎯 2. 다크모드 상태 구독

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const {
    data: planData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["tripDetail", id],
    queryFn: async () => {
      const res = await client.get(`/v1/trip/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // AI 일정 보완 Mutation
  const { mutate: regenerateTrip, isPending: isRegenerating } = useMutation({
    mutationFn: async ({ feedback }: { feedback: string }) => {
      const res = await client.post(`/v1/trip/${id}/regenerate`, { feedback });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      setFeedback("");
      setShowFeedbackForm(false);
      alert("보완 완료 ✨\nAI가 일정을 보완하였습니다!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.detail || "일정 보완 중 오류가 발생했습니다.");
    },
  });

  // 일정 삭제 Mutation
  const { mutate: deleteTrip, isPending: deletePending } = useMutation({
    mutationFn: async () => {
      const response = await client.delete(`/v1/trip/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      queryClient.invalidateQueries({ queryKey: ["userTripStats"] });
      queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });
      alert("여행 일정이 성공적으로 삭제되었습니다.");
      router.replace("/plans");
    },
    onError: () => {
      alert("삭제 중 오류가 발생했습니다.");
    },
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim())
      return alert("AI에게 요청할 수정 피드백을 입력해주세요!");
    regenerateTrip({ feedback });
  };

  const handleDeletePress = () => {
    if (confirm("정말로 여행 일정을 삭제하시겠습니까?")) {
      deleteTrip();
    }
  };

  // 웹 표준 공유기능
  const handleShare = async () => {
    if (!planData) return;
    const shareMessage = `✈️ [${planData.location}] 여행 일정을 공유합니다!\n\n📌 제목: ${planData.title}\n📝 개요: ${planData.overview}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${planData.location} 여행 일정`,
          text: shareMessage,
          url: window.location.href,
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

  // 구글 맵 길찾기 링크 핸들러
  const openGoogleMapsDirection = (
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number,
  ) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=transit`;
    window.open(googleMapsUrl, "_blank");
  };

  
  if (isPending) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 gap-3 transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
      >
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p
          className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          상세 일정을 불러오는 중...
        </p>
      </div>
    );
  }

  if (isError || !planData) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 text-center transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
      >
        <h2 className="text-base font-bold text-red-500 mb-2">
          여행 일정을 불러올 수 없습니다. 😢
        </h2>
        <p
          className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {error?.message || "존재하지 않는 일정입니다."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          이전 화면으로 돌아가기
        </button>
      </div>
    );
  }

  const allPlaces = Array.isArray(planData?.itinerary)
    ? planData.itinerary.flatMap((dayItem: any) =>
        Array.isArray(dayItem?.places) ? dayItem.places : [],
      )
    : [];

  return (
    <div
      className={`min-h-screen pb-12 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* 상단 네비게이션 바 */}
      <nav
        className={`sticky top-0 z-30 border-b h-14 flex items-center justify-between px-4 mx-auto transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <button
          onClick={() => router.replace("/plans")}
          className={`w-10 h-10 flex items-center justify-center transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-bold truncate max-w-[200px]">
          {planData.location} 여행 일정 ✨
        </span>
        <button
          onClick={handleShare}
          className={`w-10 h-10 flex items-center justify-center transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
        >
          <Share2 size={20} />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-5 flex flex-col gap-5">
        {/* 1. 메인 헤더 카드 */}
        <div
          className={`border rounded-2xl p-5 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h1
            className={`text-xl font-extrabold leading-snug mb-3.5 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
          >
            {planData.title}
          </h1>
          <hr
            className={
              isDarkMode ? "border-gray-700 my-3.5" : "border-gray-100 my-3.5"
            }
          />
          <div
            className={`flex items-center gap-1.5 mb-2 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            <Compass size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">
              여행 개요
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed whitespace-pre-line ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {planData.overview}
          </p>
        </div>

        {/* 2. 맞춤형 꿀팁 섹션 */}
        {planData.custom_tips && planData.custom_tips.length > 0 && (
          <div
            className={`border rounded-2xl p-5 shadow-sm transition-colors ${
              isDarkMode
                ? "bg-amber-500/20 border-amber-500/40"
                : "bg-amber-50/60 border border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb
                size={18}
                className={isDarkMode ? "text-amber-400" : "text-amber-600"}
              />
              <h3
                className={`text-sm font-bold ${isDarkMode ? "text-amber-400" : "text-amber-800"}`}
              >
                여행 꿀팁 🍯
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
              {planData.custom_tips.map((tip: string, idx: number) => (
                <li
                  key={idx}
                  className={`flex items-start text-sm font-medium leading-normal ${isDarkMode ? "text-amber-200/80" : "text-amber-900"}`}
                >
                  <span className="text-amber-500 mr-2 flex-shrink-0">•</span>
                  <span className="flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 🗺️ 3. 한눈에 보는 방문 명소 섹션 (구글 지도 구역 컴포넌트는 오타 수정 및 프레임워크 유지) */}
        {allPlaces.length > 0 && (
          <div
            className={`border rounded-2xl p-4 shadow-sm transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin
                size={16}
                className={isDarkMode ? "text-blue-400" : "text-blue-600"}
              />
              <h3 className="text-sm font-bold">한눈에 보는 방문 명소 🗺️</h3>
            </div>
            {/* 구글지도 컴포넌트 본체는 요청대로 스타일 내부 수정을 방지하고 원본 유지 전달 */}
            <GoogleMapSection itinerary={planData.itinerary} />
          </div>
        )}

        {/* 📅 4. 상세 일차별 동선 리스트 */}
        <div>
          <h2 className="text-base font-bold mb-3.5 pl-0.5">동선 가이드</h2>
          <div className="flex flex-col gap-5">
            {planData.itinerary?.map((dayItem: any, dayIdx: number) => {
              const currentColor = dayColors[dayIdx % dayColors.length];

              return (
                <div
                  key={dayIdx}
                  className={`border rounded-2xl p-5 shadow-sm transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div
                    className="px-3 py-1.5 rounded-lg text-xs font-bold inline-block mb-4"
                    style={{
                      backgroundColor: isDarkMode
                        ? `${currentColor}20`
                        : `${currentColor}10`,
                      color: currentColor,
                    }}
                  >
                    DAY {dayItem.day}
                  </div>

                  {dayItem.places?.map((place: any, pIdx: number) => (
                    <div key={pIdx} className="group">
                      {/* 길찾기 연동 섹션 */}
                      {pIdx > 0 && (
                        <div className="flex items-center h-12 pl-1.5 relative -mt-1 mb-1">
                          <div
                            className="w-0.5 h-full opacity-40 absolute left-[5px] mt-3"
                            style={{ backgroundColor: currentColor }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const startLat = Number(
                                dayItem.places[pIdx - 1].latitude,
                              );
                              const startLng = Number(
                                dayItem.places[pIdx - 1].longitude,
                              );
                              const destLat = Number(place.latitude);
                              const destLng = Number(place.longitude);

                              if (
                                isNaN(startLat) ||
                                isNaN(startLng) ||
                                isNaN(destLat) ||
                                isNaN(destLng)
                              ) {
                                return alert(
                                  "좌표 정보가 정확하지 않아 길찾기를 열 수 없습니다.",
                                );
                              }
                              openGoogleMapsDirection(
                                startLat,
                                startLng,
                                destLat,
                                destLng,
                              );
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-white px-3 py-1 rounded-full transition-transform active:scale-95 ml-6 shadow-sm"
                            style={{ backgroundColor: currentColor }}
                          >
                            <Navigation size={11} className="fill-white" />
                            구글 맵 길찾기
                          </button>
                        </div>
                      )}

                      {/* 장소 정보 레이아웃 */}
                      <div className="flex gap-3.5 min-h-[80px]">
                        <div className="flex flex-col items-center flex-shrink-0 w-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-2"
                            style={{ backgroundColor: currentColor }}
                          />
                          {pIdx !== dayItem.places.length - 1 && (
                            <div
                              className={`w-0.5 flex-1 group-last:hidden mt-1 ${isDarkMode ? "bg-gray-700" : "bg-indigo-50"}`}
                            />
                          )}
                        </div>

                        <div className="flex-1 pb-4">
                          <h4 className="text-lg font-bold mt-1">
                            <span
                              style={{ color: currentColor }}
                              className="font-extrabold mr-1"
                            >
                              {dayItem.day}-{pIdx + 1}.
                            </span>
                            {place.place_name}
                          </h4>
                          <p
                            className={`text-sm mt-1 leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}
                          >
                            {place.description}
                          </p>

                          {/* AI 추천 코멘트 */}
                          {place.proposed_reason && (
                            <div
                              className={`border rounded-xl p-3 mt-2.5 transition-colors ${
                                isDarkMode
                                  ? "bg-gray-900/60 border-gray-700/50"
                                  : "bg-slate-50 border-slate-100"
                              }`}
                            >
                              <div className="flex items-center gap-1 text-[12px] font-bold mb-1">
                                <Sparkles
                                  size={12}
                                  style={{ color: currentColor }}
                                />
                                <span>AI 추천 이유</span>
                              </div>
                              <p
                                className={`text-[13px] leading-normal ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {place.proposed_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🛠️ 5. 하단 액션 버튼 그룹 */}
        <div className="flex flex-col gap-3 mt-2">
          {!showFeedbackForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowFeedbackForm(true)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/5 transition-all text-md"
              >
                일정 보완하기 🤖
              </button>

              <button
                type="button"
                onClick={handleDeletePress}
                disabled={deletePending}
                className={`w-full py-4 border font-semibold rounded-2xl transition-all text-md ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                일정 삭제하기
              </button>
            </>
          ) : (
            // AI 수정 요청 폼 활성화 구조
            <form
              onSubmit={handleFeedbackSubmit}
              className={`border rounded-2xl p-4 shadow-sm transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <MessageSquare
                  size={16}
                  className={isDarkMode ? "text-blue-400" : "text-blue-600"}
                />
                <span className="text-sm font-bold">
                  보완하고 싶은 내용을 적어주세요.
                </span>
              </div>

              <textarea
                className={`w-full h-24 border rounded-xl p-3 text-sm outline-none focus:border-blue-500 resize-none transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
                placeholder="예) 둘째 날 저녁에 예쁜 야경 코스 하나 추가해줘! 혹은 전체 기간 하루 늘려줘."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isRegenerating}
              />

              <div className="flex justify-end gap-2 mt-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setFeedback("");
                  }}
                  disabled={isRegenerating}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                  }`}
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={!feedback.trim() || isRegenerating}
                  className={`px-4 py-2.5 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                    !feedback.trim() || isRegenerating
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isRegenerating ? (
                    <>
                      <span>보완 요청 중</span>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </>
                  ) : (
                    <span>보완 요청 ✨</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
