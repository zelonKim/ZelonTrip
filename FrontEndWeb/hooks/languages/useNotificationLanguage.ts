"use client";

import { useSyncExternalStore } from "react";

const notificationTexts = {
  ko: {
    headerTitle: "알림함 🔔",
    backLabel: "뒤로 가기",
    deleteAll: "전체 삭제",
    deleteSingle: "알림 삭제",
    defaultNotiTitle: "새로운 알림",
    emptyNoti: "도착한 알림이 없습니다.",
    dateFormat: "ko-KR" as const,
    dateOptions: {
      month: "short" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
  },
  en: {
    headerTitle: "Notifications 🔔",
    backLabel: "Go Back",
    deleteAll: "Clear All",
    deleteSingle: "Delete Notification",
    defaultNotiTitle: "New Notification",
    emptyNoti: "No notifications received.",
    dateFormat: "en-US" as const,
    dateOptions: {
      month: "short" as const,
      day: "numeric" as const,
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    },
  },
} as const;

type Locale = keyof typeof notificationTexts;

const emptySubscribe = () => () => {};

export function useNotificationLanguage() {
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

  return { t: notificationTexts[locale], locale };
}
