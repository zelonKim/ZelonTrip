"use client";

import { useSyncExternalStore } from "react";

const generatedPlanTexts = {
  ko: {
    loading: "상세 일정을 불러오는 중...",
    errorTitle: "여행 일정을 불러올 수 없습니다. 😢",
    defaultError: "존재하지 않는 일정입니다.",
    backButton: "이전 화면으로 돌아가기",
    tripSuffix: " 여행 일정 ✨",
    overviewTitle: "여행 개요",
    tipsTitle: "여행 꿀팁 🍯",
    placesTitle: "한눈에 보는 방문 명소 🗺️",
    routeGuideTitle: "동선 가이드",
    mapDirectionBtn: "구글 맵 길찾기",
    coordError: "좌표 정보가 정확하지 않아 길찾기를 열 수 없습니다.",
    aiReasonTitle: "AI 추천 이유",
    editPlanBtn: "일정 보완하기 🤖",
    deletePlanBtn: "일정 삭제하기",
    deleteConfirm: "정말로 여행 일정을 삭제하시겠습니까?",
    feedbackTitle: "보완하고 싶은 내용을 적어주세요.",
    feedbackPlaceholder: "예) 둘째 날 저녁에 예쁜 야경 코스 하나 추가해줘! 혹은 전체 기간 하루 늘려줘.",
    cancel: "취소",
    requesting: "보완 요청 중",
    requestBtn: "보완 요청 ✨",
    feedbackAlert: "AI에게 요청할 수정 피드백을 입력해주세요!",
  },
  en: {
    loading: "Loading itinerary details...",
    errorTitle: "Failed to load travel itinerary. 😢",
    defaultError: "The itinerary does not exist.",
    backButton: "Back to Previous Page",
    tripSuffix: " Itinerary ✨",
    overviewTitle: "Trip Overview",
    tipsTitle: "Travel Tips 🍯",
    placesTitle: "Places at a Glance 🗺️",
    routeGuideTitle: "Route Guide",
    mapDirectionBtn: "Google Maps Directions",
    coordError: "Cannot open directions because coordinate information is invalid.",
    aiReasonTitle: "AI Recommendation Reason",
    editPlanBtn: "Refine Itinerary 🤖",
    deletePlanBtn: "Delete Itinerary",
    deleteConfirm: "Are you sure you want to delete this itinerary?",
    feedbackTitle: "Please enter what you'd like to modify or refine.",
    feedbackPlaceholder: "e.g., Add a nice night view spot on the second night evening!",
    cancel: "Cancel",
    requesting: "Refining",
    requestBtn: "Request Refinement ✨",
    feedbackAlert: "Please enter feedback to request from AI!",
  },
} as const;

type Locale = keyof typeof generatedPlanTexts;

const emptySubscribe = () => () => {};

export function useGeneratedPlanLanguage() {
  const locale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => {
      const browserLang =
        navigator.language || (navigator.languages && navigator.languages[0]);
      return browserLang && !browserLang.toLowerCase().startsWith("ko")
        ? "en"
        : "ko";
    },
    () => "ko"
  );

  return { t: generatedPlanTexts[locale], locale };
}