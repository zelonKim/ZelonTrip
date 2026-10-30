"use client";

import { useSyncExternalStore } from "react";

const myPageTexts = {
  ko: {
    headerTitle: "마이페이지",
    editNickname: "닉네임 수정하기",
    createNickname: "닉네임 만들기 ✏️",
    badgeTitle: "취득한 뱃지",
    badgePro: "✈️ 프로 여행러",
    badgeIntermediate: "👟 중급 여행러",
    badgeBeginner: "🐣 초보 여행러",
    analyzing: "⏳ 분석 중...",
    accumulatedDays: (days: number) => `⏱️ 누적 ${days}일째 여행 중`,
    footprintsTitle: "나의 여행 발자국",
    footprintsDesc: (count: number) =>
      `지금까지 ZelonTrip과 함께 ${count}개의 여행지를 탐방했어요!`,
    settingsTitle: "앱 설정 및 지원",
    darkMode: "다크모드",
    notice: "공지사항",
    feedback: "피드백 보내기",
    logout: "로그아웃",
    deactivate: "회원 탈퇴",
    version: "버전 정보 v1.0.0 (최신 버전)",

    logoutConfirm: "정말 로그아웃 하시겠습니까?",
    logoutError: "로그아웃 처리 중 오류가 발생했습니다.",
    deactivateConfirm:
      "회원 탈퇴\n\n정말 탈퇴하시겠습니까?\n탈퇴 시 서비스 이용이 제한됩니다.",
  },
  en: {
    headerTitle: "My Page",
    editNickname: "Edit Nickname",
    createNickname: "Create Nickname ✏️",
    badgeTitle: "Earned Badges",
    badgePro: "✈️ Pro Traveler",
    badgeIntermediate: "👟 Intermediate Traveler",
    badgeBeginner: "🐣 Beginner Traveler",
    analyzing: "⏳ Analyzing...",
    accumulatedDays: (days: number) => `⏱️ Traveling for ${days} days total`,
    footprintsTitle: "My Travel Footprints",
    footprintsDesc: (count: number) =>
      `You've explored ${count} destinations with ZelonTrip so far!`,
    settingsTitle: "App Settings & Support",
    darkMode: "Dark Mode",
    notice: "Notices",
    feedback: "Send Feedback",
    logout: "Log Out",
    deactivate: "Delete Account",
    version: "Version v1.0.0 (Latest)",

    logoutConfirm: "Are you sure you want to log out?",
    logoutError: "An error occurred during logout.",
    deactivateConfirm:
      "Account Deletion\n\nAre you sure you want to delete your account?\nService access will be restricted upon deletion.",
  },
} as const;

type Locale = keyof typeof myPageTexts;

const emptySubscribe = () => () => {};

export function useMyPageLanguage() {
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

  return { t: myPageTexts[locale], locale };
}
