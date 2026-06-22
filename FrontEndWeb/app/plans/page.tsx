"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Compass, ArrowRight, CalendarDays, Inbox } from "lucide-react";
import { client } from "@/api/client";
import { useTheme } from "@/context/ThemeContext"; // 🎯 1. 전역 테마 훅 가져오기

export default function PlansPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme(); // 🎯 2. 다크모드 상태 구독

  // 백엔드 API에서 여행 목록 조회
  const fetchTripList = async () => {
    const response = await client.get("/v1/trip/list");
    return response.data;
  };

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tripList"],
    queryFn: fetchTripList,
  });

  // 동적 라우트 주소(`/plan/[id]`)로 이동 핸들러
  const handlePlanPress = (id: string | number) => {
    router.push(`/plan/${id}`);
  };

  // 1. 로딩(Pending) 상태 UI
  if (isPending) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 gap-3 transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p
          className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          나의 여행 일정들을 불러오는 중...
        </p>
      </div>
    );
  }

  // 2. 에러(Error) 상태 UI
  if (isError) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-5 text-center transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <h2 className="text-base font-bold text-red-500 mb-1">
          일정을 불러오지 못했습니다. 😭
        </h2>
        <p
          className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {(error as any)?.message || "알 수 없는 에러가 발생했습니다."}
        </p>
      </div>
    );
  }

  const plans = data?.trips || [];

  return (
    <div
      className={`min-h-screen pb-10 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto pt-10 px-4">
        {/* 헤더 섹션 */}
        <header
          className={`mb-3 border-b pb-4 ${isDarkMode ? "border-gray-800" : "border-b-transparent"}`}
        >
          <h1 className="text-2xl font-bold mb-1.5">나의 여행 일정 🗓️</h1>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} leading-relaxed`}
          >
            AI가 생성한 맞춤형 여행 일정들이에요.
          </p>
        </header>

        {/* 3. 데이터 결과 분기 UI */}
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-1.5">
            <Inbox
              size={40}
              className={isDarkMode ? "text-gray-600" : "text-gray-400"}
            />
            <h3
              className={`text-sm font-semibold mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}
            >
              아직 생성된 여행 일정이 없습니다.
            </h3>
            <p
              className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
            >
              첫 번째 AI 추천 일정을 생성해 보세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {plans.map((plan: any) => (
              <div
                key={plan.id}
                onClick={() => handlePlanPress(plan.id)}
                className={`border rounded-2xl p-4.5 shadow-sm cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] hover:shadow-md ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                    : "bg-white border-gray-200 hover:border-blue-400"
                }`}
              >
                {/* 카드 상단 정보 */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                      isDarkMode
                        ? "bg-blue-950/40 text-blue-400"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <MapPin size={14} />
                    <span className="text-[11px] font-bold">
                      {plan.location}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  >
                    <CalendarDays size={13} />
                    <span
                      className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {plan.itinerary?.length === 1
                        ? "당일치기"
                        : `${plan.itinerary?.length - 1}박 ${plan.itinerary?.length}일`}
                    </span>
                  </div>
                </div>

                {/* 카드 제목 */}
                <h2
                  className={`text-lg font-bold mb-2.5 pl-1.5 line-clamp-2 leading-snug ${
                    isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {plan.title}
                </h2>

                {/* 개요(Overview) 박스 */}
                <div
                  className={`flex items-start rounded-xl p-3 mb-3.5 transition-colors ${
                    isDarkMode ? "bg-gray-900/60" : "bg-gray-50"
                  }`}
                >
                  <Compass
                    size={16}
                    className={`mt-0.5 mr-2 flex-shrink-0 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                  />
                  <p
                    className={`text-sm leading-normal line-clamp-3 flex-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {plan.overview}
                  </p>
                </div>

                {/* 푸터 버튼 */}
                <div
                  className={`flex items-center justify-end gap-1 ${
                    isDarkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  <span className="text-xs font-semibold">
                    일정 자세히 보기
                  </span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
