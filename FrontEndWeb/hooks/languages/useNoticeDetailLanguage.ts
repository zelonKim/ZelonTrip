"use client";

import { useSyncExternalStore } from "react";

const noticeDetailTexts = {
  ko: {
    loading: "공지사항을 읽어오는 중입니다...",
    errorMsg: "공지사항을 불러오지 못했습니다.",
    defaultError: "존재하지 않는 공지사항입니다.",
    backButton: "목록으로",
    backTitle: "공지사항 목록으로 이동",
    headerTitle: "공지사항 상세",
    importantBadge: "중요",
    dateFormat: "ko-KR" as const,
    dateOptions: {
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
  },
  en: {
    loading: "Loading notice details...",
    errorMsg: "Failed to load notice.",
    defaultError: "Notice does not exist.",
    backButton: "Back to List",
    backTitle: "Go to Notice List",
    headerTitle: "Notice Details",
    importantBadge: "Important",
    dateFormat: "en-US" as const,
    dateOptions: {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
  },
} as const;

type Locale = keyof typeof noticeDetailTexts;

const emptySubscribe = () => () => {};

export function useNoticeDetailLanguage() {
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

  return { t: noticeDetailTexts[locale], locale };
}