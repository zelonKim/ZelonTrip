"use client";

import { useSyncExternalStore } from "react";

const androidDownloadTexts = {
  ko: {
    qrAlt: "Android 앱 설치 QR 코드",
    supportedEnv: "지원 환경:",
    testAccount: "테스트 계정:",
    password: "비밀번호:",
    guideNotice: "출처를 알 수 없는 앱 경고 발생 시 '무시하고 설치' 선택",
  },
  en: {
    qrAlt: "Android App Install QR Code",
    supportedEnv: "Supported Platform:",
    testAccount: "Test Account:",
    password: "Password:",
    guideNotice:
      "If an 'Unknown Source' warning appears, select 'Install Anyway",
  },
} as const;

type Locale = keyof typeof androidDownloadTexts;

const emptySubscribe = () => () => {};

export function useAndroidDownloadLanguage() {
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

  return { t: androidDownloadTexts[locale], locale };
}
