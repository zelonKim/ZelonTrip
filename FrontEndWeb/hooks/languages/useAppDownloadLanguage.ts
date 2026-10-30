"use client";

import { useSyncExternalStore } from "react";

const appDownloadTexts = {
  ko: {
    title: "ZelonTrip 모바일 앱 🏝️",
    subtitle: "원하시는 모바일 운영체제를 선택해 주세요",
    androidTab: "Android",
    iosTab: "iOS (iPhone)",
    confirmButton: "확인",
  },
  en: {
    title: "ZelonTrip Mobile App 🏝️",
    subtitle: "Please select your mobile operating system",
    androidTab: "Android",
    iosTab: "iOS (iPhone)",
    confirmButton: "OK",
  },
} as const;

type Locale = keyof typeof appDownloadTexts;

const emptySubscribe = () => () => {};

export function useAppDownloadLanguage() {
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

  return { t: appDownloadTexts[locale], locale };
}
