"use client";

import { useSyncExternalStore } from "react";

const answerTexts = {
  ko: {
    loadingPrefix: "AI가 ",
    loadingSuffix: " 여행 정보를\n가져오고 있어요.",
    defaultImageAlt: "여행지 이미지",
    backTooltip: "뒤로가기",
    guideSubtitle: "AI 맞춤 여행 가이드",
    aiGuideTitle: "AI의 특별 가이드",
    defaultContent: "가이드 내용을 불러오지 못했습니다.",
    homeButton: "홈으로",
  },
  en: {
    loadingPrefix: "AI is fetching travel info for ",
    loadingSuffix: ".",
    defaultImageAlt: "Destination Image",
    backTooltip: "Go Back",
    guideSubtitle: "AI Custom Travel Guide",
    aiGuideTitle: "AI Special Guide",
    defaultContent: "Failed to load guide content.",
    homeButton: "Go Home",
  },
} as const;

type Locale = keyof typeof answerTexts;

const emptySubscribe = () => () => {};

export function useAnswerLanguage() {
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

  return { t: answerTexts[locale], locale };
}
