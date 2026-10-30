"use client";

import { useSyncExternalStore } from "react";

const noticePageTexts = {
  ko: {
    loading: "공지사항을 불러오는 중입니다...",
    errorMsg: "공지사항을 불러오지 못했습니다.",
    retry: "다시 시도",
    defaultError: "다시 시도해 주세요.",
    backTitle: "마이페이지로 이동",
    headerTitle: "공지사항 📢",
    refreshTitle: "새로고침",
    emptyNotice: "등록된 공지사항이 없습니다.",
    dateFormat: "ko-KR" as const,
    dateOptions: {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
    },
  },
  en: {
    loading: "Loading notices...",
    errorMsg: "Failed to load notices.",
    retry: "Try Again",
    defaultError: "Please try again.",
    backTitle: "Go to My Page",
    headerTitle: "Notices 📢",
    refreshTitle: "Refresh",
    emptyNotice: "No notices registered.",
    dateFormat: "en-US" as const,
    dateOptions: {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
    },
  },
} as const;

type Locale = keyof typeof noticePageTexts;

const emptySubscribe = () => () => {};

export function useNoticePageLanguage() {
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

  return { t: noticePageTexts[locale], locale };
}
