"use client";

import { useSyncExternalStore } from "react";

const askLocationTexts = {
  ko: {
    modalTitle: "🤖 여행지 맞춤 정보",
    description: "AI에게 궁금한 여행지를 물어보면 맞춤 여행 정보를 답변해줘요.",
    placeholder: "예: 도쿄, 뉴욕, 파리, 런던 등",
    submitButton: "물어보기",
  },
  en: {
    modalTitle: "🤖 Custom Travel Info",
    description:
      "Ask AI about any destination to get personalized travel recommendations.",
    placeholder: "e.g., Tokyo, New York, Paris, London, etc.",
    submitButton: "Ask AI",
  },
} as const;

type Locale = keyof typeof askLocationTexts;

const emptySubscribe = () => () => {};

export function useAskLocationLanguage() {
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

  return { t: askLocationTexts[locale], locale };
}
