"use client";

import { useSyncExternalStore } from "react";

const nicknameModalTexts = {
  ko: {
    title: "닉네임 설정",
    description: "새로운 닉네임을 입력해 주세요.",
    placeholder: "닉네임 입력",
    cancel: "취소",
    save: "저장",
    alertEmpty: "닉네임을 입력해 주세요.",
  },
  en: {
    title: "Set Nickname",
    description: "Please enter a new nickname.",
    placeholder: "Enter nickname",
    cancel: "Cancel",
    save: "Save",
    alertEmpty: "Please enter a nickname.",
  },
} as const;

type Locale = keyof typeof nicknameModalTexts;

const emptySubscribe = () => () => {};

export function useNicknameModalLanguage() {
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

  return { t: nicknameModalTexts[locale], locale };
}