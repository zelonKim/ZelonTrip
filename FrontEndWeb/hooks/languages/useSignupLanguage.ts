"use client";

import { useSyncExternalStore } from "react";

const signupTexts = {
  ko: {
    title: "AI와 함께 떠나요! ✈️",
    subtitle: "ZelonTrip과 함께 여행을 시작해볼까요?",
    emailLabel: "이메일",
    emailPlaceholder: "example@email.com",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "영문+숫자 조합 8자 이상",
    passwordConfirmLabel: "비밀번호 확인",
    passwordConfirmPlaceholder: "비밀번호를 다시 입력해주세요",
    signupButton: "시작하기",
    signingUp: "가입 중...",
    alreadyHaveAccount: "이미 계정이 있으신가요?",
    login: "로그인",
    alertInputAll: "모든 정보를 입력해주세요.",
    alertInvalidEmail: "올바른 이메일 형식이 아닙니다.",
    alertInvalidPassword: "비밀번호는 영문+숫자 8자 이상입니다.",
    alertPasswordMismatch: "비밀번호가 일치하지 않습니다.",
  },
  en: {
    title: "Let's travel with AI ✈️",
    subtitle: "Shall we start our journey with ZelonTrip?",
    emailLabel: "Email",
    emailPlaceholder: "example@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters (Letters + Numbers)",
    passwordConfirmLabel: "Confirm Password",
    passwordConfirmPlaceholder: "Please re-enter your password",
    signupButton: "Get Started",
    signingUp: "Signing up...",
    alreadyHaveAccount: "Already have an account?",
    login: "Log In",
    alertInputAll: "Please fill in all fields.",
    alertInvalidEmail: "Please enter a valid email address.",
    alertInvalidPassword:
      "Password must be at least 8 characters with letters and numbers.",
    alertPasswordMismatch: "Passwords do not match.",
  },
} as const;

type Locale = keyof typeof signupTexts;

const emptySubscribe = () => () => {};

export function useSignupLanguage() {
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

  return { t: signupTexts[locale], locale };
}
