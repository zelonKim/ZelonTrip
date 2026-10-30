"use client";

import { useSyncExternalStore } from "react";

const generateTexts = {
  ko: {
    headerTitle: "AI 맞춤 여행 생성 ✨",
    headerDesc: "취향 태그를 고르고 특별한 요청사항을 입력해 보세요.",
    locationLabel: "여행지",
    locationPlaceholder: "어디로 떠나시나요? (예: 도쿄, 뉴욕)",
    daysLabel: "여행 기간",
    dayTrip: "당일치기",
    formatDays: (d: number) => `${d}박 ${d + 1}일`,
    mbtiLabel: "나의 MBTI",
    preferenceTitle: "어떤 여행을 원하시나요? (중복 가능)",
    tripStyleLabel: "여행 스타일",
    tendencyLabel: "식당 성향",
    customRequestLabel: "나만의 특별 요청사항 (선택)",
    customRequestPlaceholder: "예: 교통이 편한 곳 위주로 관광 코스를 짜주세요.",
    companionLabel: "누구와 함께하나요?",
    transportLabel: "주요 이동 수단",
    paceLabel: "여행 일정 페이스",
    paceRelaxed: "1 (여유)",
    paceBusy: "10 (빡빡)",
    submitButton: "여행 일정 생성하기 🤖",
    submitting: "여행 일정 생성 중",

    alertLocation: "여행지를 입력해 주세요.",
    alertMbti: "MBTI를 선택해 주세요.",
    alertTripStyle: "여행 스타일을 선택해 주세요.",
    alertTendency: "식당 성향을 선택해 주세요.",
    alertCompanion: "누구와 함께하는지 선택해 주세요.",
    alertTransport: "주요 이동 수단을 선택해 주세요.",
  },
  en: {
    headerTitle: "AI Custom Trip Generator ✨",
    headerDesc: "Choose your taste tags and enter special requests.",
    locationLabel: "Destination",
    locationPlaceholder: "Where are you going? (e.g., Tokyo, New York)",
    daysLabel: "Duration",
    dayTrip: "Day Trip",
    formatDays: (d: number) => `${d + 1} Days / ${d} Night`,
    mbtiLabel: "My MBTI",
    preferenceTitle: "What kind of trip do you want? (Multiple choices)",
    tripStyleLabel: "Trip Style",
    tendencyLabel: "Dining Preference",
    customRequestLabel: "Special Requests (Optional)",
    customRequestPlaceholder:
      "e.g., Please plan courses with easy transportation.",
    companionLabel: "Who are you traveling with?",
    transportLabel: "Main Transportation",
    paceLabel: "Trip Pace",
    paceRelaxed: "1 (Relaxed)",
    paceBusy: "10 (Busy)",
    submitButton: "Generate Trip Plan 🤖",
    submitting: "Generating Trip Plan",

    alertLocation: "Please enter a destination.",
    alertMbti: "Please select your MBTI.",
    alertTripStyle: "Please select a trip style.",
    alertTendency: "Please select a dining preference.",
    alertCompanion: "Please select who you are traveling with.",
    alertTransport: "Please select a main transportation.",
  },
} as const;

type Locale = keyof typeof generateTexts;

const emptySubscribe = () => () => {};

export function useGenerateLanguage() {
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

  return { t: generateTexts[locale], locale };
}
