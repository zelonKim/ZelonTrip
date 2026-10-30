"use client";

import { useSyncExternalStore } from "react";

const iosDownloadTexts = {
  ko: {
    qrAlt: "ZelonTrip TestFlight QR 코드",
    scanGuidePart1: "아이폰 카메라로 QR 코드를 스캔하면\n",
    scanGuideHighlight: "TestFlight",
    scanGuidePart2: "를 통해 앱을 설치할 수 있습니다.",
    supportedEnv: "지원 환경:",
    testAccount: "테스트 계정:",
    password: "비밀번호:",
    prerequisitePart1: "테스터 참여를 위해 기기에 ",
    prerequisiteHighlight: "TestFlight",
    prerequisitePart2: " 앱이 먼저 설치되어 있어야 합니다.",
  },
  en: {
    qrAlt: "ZelonTrip TestFlight QR Code",
    scanGuidePart1: "Scan the QR code with your iPhone camera to install the app via ",
    scanGuideHighlight: "TestFlight",
    scanGuidePart2: ".",
    supportedEnv: "Supported Platform:",
    testAccount: "Test Account:",
    password: "Password:",
    prerequisitePart1: "The ",
    prerequisiteHighlight: "TestFlight",
    prerequisitePart2: " app must be installed on your device first to participate as a tester.",
  },
} as const;

type Locale = keyof typeof iosDownloadTexts;

const emptySubscribe = () => () => {};

export function useIosDownloadLanguage() {
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

  return { t: iosDownloadTexts[locale], locale };
}