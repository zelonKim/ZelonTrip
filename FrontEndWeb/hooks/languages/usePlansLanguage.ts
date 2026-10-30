"use client";

import { useSyncExternalStore } from "react";

const plansTexts = {
  ko: {
    loading: "나의 여행 일정들을 불러오는 중...",
    errorTitle: "일정을 불러오지 못했습니다. 😭",
    defaultError: "알 수 없는 에러가 발생했습니다.",
    headerTitle: "나의 여행 일정 🗓️",
    headerDesc: "AI가 생성한 맞춤형 여행 일정들이에요.",
    emptyTitle: "아직 생성된 여행 일정이 없습니다.",
    emptyDesc: "첫 번째 AI 추천 일정을 생성해 보세요!",
    dayTrip: "당일치기",
    formatDays: (length: number) => `${length - 1}박 ${length}일`,
    detailView: "일정 자세히 보기",
  },
  en: {
    loading: "Loading your travel itineraries...",
    errorTitle: "Failed to load itineraries. 😭",
    defaultError: "An unknown error occurred.",
    headerTitle: "My Itineraries 🗓️",
    headerDesc: "Personalized travel plans created by AI.",
    emptyTitle: "No travel itineraries created yet.",
    emptyDesc: "Generate your first AI recommended plan!",
    dayTrip: "Day Trip",
    formatDays: (length: number) => `${length} Days, ${length - 1} Nights`,
    detailView: "View Details",
  },
} as const;

type Locale = keyof typeof plansTexts;

const emptySubscribe = () => () => {};

export function usePlansLanguage() {
  const locale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => {
      const browserLang =
        navigator.language || (navigator.languages && navigator.languages[0]);
      return browserLang && !browserLang.toLowerCase().startsWith("ko")
        ? "en"
        : "ko";
    },
    () => "ko",
  );

  return { t: plansTexts[locale], locale };
}
