"use client";

import { useSyncExternalStore } from "react";

const feedbackModalTexts = {
  ko: {
    title: "💬 피드백 보내기",
    description:
      "ZelonTrip을 이용하면서 좋았던 점이나 불편했던 점을 \n 자유롭게 작성해주세요.",
    placeholder: "여기에 내용을 입력해 주세요 (최대 300자)",
    cancel: "취소",
    submit: "보내기",
    sending: "보내는 중",
    emptyAlert: "피드백 내용을 입력해 주세요.",
    minLenAlert: "피드백을 최소 5자 이상 입력해주세요.",
  },
  en: {
    title: "💬 Send Feedback",
    description:
      "Feel free to share what you liked or what could be improved about ZelonTrip.",
    placeholder: "Please type your feedback here (Max 300 characters)",
    cancel: "Cancel",
    submit: "Send",
    sending: "Sending",
    emptyAlert: "Please enter your feedback.",
    minLenAlert: "Please enter at least 5 characters for your feedback.",
  },
} as const;

type Locale = keyof typeof feedbackModalTexts;

const emptySubscribe = () => () => {};

export function useFeedbackModalLanguage() {
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

  return { t: feedbackModalTexts[locale], locale };
}
