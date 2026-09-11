"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
import GoogleMapSection from "../../../component/GoogleMapSection";
import { useTheme } from "@/context/ThemeContext";
import { dayColors } from "@/constants/daysColors";
import { openGoogleMapsDirection } from "@/utils/openGoogleMapsDirection";
import { getTripDetail } from "@/api/trip/getTripDetail";
import { useRegenerateTrip } from "@/hooks/useRegenerateTrip";
import { useDeleteTrip } from "@/hooks/useDeleteTrip";
import { planSharing } from "@/utils/planSharing";
import { ItineraryItem } from "@/types/ItineraryItem";
import { Place } from "@/types/Place";

export default function GeneratedPlanPage() {
  const router = useRouter();
  const { id } = useParams();
  const { isDarkMode } = useTheme();

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { mutate: regenerateMutation, isPending: isRegenerating } =
    useRegenerateTrip({
      onSuccessCallback: () => {
        setFeedback("");
        setShowFeedbackForm(false);
      },
    });

  const handleFeedbackSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert("AI에게 요청할 수정 피드백을 입력해주세요!");
      return;
    }
    regenerateMutation({ tripId: id!, feedback });
  };

  ////////////////////////////////////////////////////////////////////////////////////////

  const { mutate: deleteTripMutation, isPending: deleteTripPending } =
    useDeleteTrip();

  const handleDeleteTrip = (tripId: number | string) => {
    if (confirm("정말로 여행 일정을 삭제하시겠습니까?")) {
      deleteTripMutation(tripId);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////

  const {
    data: planData,
    isPending: isPlanPending,
    isError: isPlanError,
    error: PlanError,
  } = useQuery({
    queryKey: ["tripDetail", id],
    queryFn: () => getTripDetail(id!),
    enabled: !!id,
  });

  if (isPlanPending) {
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

  if (isPlanError || !planData) {
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
          {PlanError?.message || "존재하지 않는 일정입니다."}
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
    ? planData.itinerary.flatMap((dayItem) =>
        Array.isArray(dayItem?.places) ? dayItem.places : [],
      )
    : [];

  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div
      className={`min-h-screen pb-12 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
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
          onClick={() => planSharing(planData)}
          className={`w-10 h-10 flex items-center justify-center transition-colors ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}
        >
          <Share2 size={20} />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-5 pt-5 flex flex-col gap-5">
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

            <GoogleMapSection itinerary={planData.itinerary} />
          </div>
        )}

        <div>
          <h2 className="text-base font-bold mb-3.5 pl-0.5">동선 가이드</h2>
          <div className="flex flex-col gap-5">
            {planData.itinerary?.map(
              (dayItem: ItineraryItem, dayIdx: number) => {
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

                    {dayItem.places?.map((place: Place, pIdx: number) => (
                      <div key={pIdx} className="group">
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
              },
            )}
          </div>
        </div>

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
                onClick={() => handleDeleteTrip(planData.id)}
                disabled={deleteTripPending}
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
