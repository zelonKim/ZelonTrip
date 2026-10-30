"use client";

import { useSyncExternalStore } from "react";

const loginTexts = {
  ko: {
    subtitle: "내가 원하는 맞춤 AI 여행 플래너",
    appDownload: "앱 다운로드",
    emailLabel: "이메일",
    emailPlaceholder: "이메일을 입력해주세요",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "비밀번호를 입력해주세요",
    loginButton: "로그인하기",
    loggingIn: "로그인 중",
    noAccount: "아직 계정이 없으신가요?",
    signup: "회원가입",
    alertInputBoth: "이메일과 비밀번호를 모두 입력해주세요.",
  },
  en: {
    subtitle: "Your Personalized AI Travel Planner",
    appDownload: "App Download",
    emailLabel: "Email",
    emailPlaceholder: "Please enter your email",
    passwordLabel: "Password",
    passwordPlaceholder: "Please enter your password",
    loginButton: "Log In",
    loggingIn: "Logging in",
    noAccount: "Don't have an account yet?",
    signup: "Sign Up",
    alertInputBoth: "Please enter both email and password.",
  },
} as const;

type Locale = keyof typeof loginTexts;

const emptySubscribe = () => () => {};

export function useLoginLanguage() {
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

  return { t: loginTexts[locale], locale };
}