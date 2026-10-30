"use client";

import { useSyncExternalStore } from "react";

const menuTabBarTexts = {
  ko: {
    home: "홈",
    generate: "여행 생성",
    plans: "일정 조회",
    mypage: "마이페이지",
  },
  en: {
    home: "Home",
    generate: "Create Trip",
    plans: "Itineraries",
    mypage: "My Page",
  },
} as const;

type Locale = keyof typeof menuTabBarTexts;

const emptySubscribe = () => () => {};

export function useMenuTabBarLanguage() {
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

  return { t: menuTabBarTexts[locale], locale };
}