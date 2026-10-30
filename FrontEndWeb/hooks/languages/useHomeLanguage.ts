"use client";

import { useSyncExternalStore } from "react";

const homeTexts = {
  ko: {
    currentLocation: "현재 위치",
    locating: "위치 탐색 중...",
    defaultTraveler: "여행자",
    greetingSuffix: "님,",
    mainTitle: "어디로 떠나고\n싶으신가요?",
    searchPlaceholder: "궁금한 여행지를 물어보세요.",
    recommendTitle: "맞춤 여행지 추천",
    recommendLoading: "당신을 위한 맞춤 여행지 분석중...",
    emptyRecommend: "추천 가능한 여행지가 없습니다.",
    bannerSub: "혹시, 여행 중이신가요?",
    bannerTitle: "구글 맵 켜기",
    alertInputLocation: "여행지를 입력해 주세요!",
  },
  en: {
    currentLocation: "Current Location",
    locating: "Finding location...",
    defaultTraveler: "Traveler",
    greetingSuffix: ",",
    mainTitle: "Where would you like\nto go?",
    searchPlaceholder: "Ask about any destination you're curious about",
    recommendTitle: "Recommended Trips For You",
    recommendLoading: "Analyzing tailored travel spots for you...",
    emptyRecommend: "No recommended destinations available.",
    bannerSub: "Are you currently on a trip?",
    bannerTitle: "Open Google Maps",
    alertInputLocation: "Please enter a destination!",
  },
} as const;

type Locale = keyof typeof homeTexts;

const emptySubscribe = () => () => {};

export function useHomeLanguage() {
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

  return { t: homeTexts[locale], locale };
}
