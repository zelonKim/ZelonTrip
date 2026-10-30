import { NotificationItem } from "@/types/NotificationItem";
import { Dispatch, SetStateAction } from "react";

const clearNotificationTexts = {
  ko: {
    confirmClearAll: "모든 알림을 삭제하시겠습니까?",
  },
  en: {
    confirmClearAll: "Are you sure you want to delete all notifications?",
  },
} as const;

const getLocale = (): keyof typeof clearNotificationTexts => {
  if (typeof window === "undefined") return "ko";
  const browserLang =
    navigator.language || (navigator.languages && navigator.languages[0]);
  return browserLang && !browserLang.toLowerCase().startsWith("ko")
    ? "en"
    : "ko";
};

export const clearAllNotifications = (
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>,
) => {
  const locale = getLocale();
  const t = clearNotificationTexts[locale];

  if (window.confirm(t.confirmClearAll)) {
    setNotifications([]);
    localStorage.removeItem("zelontrip_notifications");
  }
};
