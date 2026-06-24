"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { client } from "@/api/client";
import SecureLS from "secure-ls";
import { useTheme } from "@/context/ThemeContext";

interface LoginCredentials {
  email: string;
  password: string;
}

const loginApi = async (credentials: LoginCredentials) => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const res = await client.post("/v1/auth/login", formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.data;
};

const ls =
  typeof window !== "undefined" ? new SecureLS({ encodingType: "aes" }) : null;

export default function LoginPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 📱 앱 다운로드 모달 및 내부 탭 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      const { access_token } = data;

      if (access_token) {
        if (ls) {
          ls.set("userToken", access_token);
        } else {
          localStorage.setItem("userToken", access_token);
        }

        router.replace("/");
      } else {
        alert("안내: 토큰을 받아오지 못했습니다.");
      }
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "로그인 중 에러가 발생했습니다.";
      alert(`안내: ${errorMsg}`);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("안내: 이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    mutate({ email, password });
  };

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-center items-center px-6 py-12 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      {/* 📱 1. 우측 상단 앱 다운로드 고정 버튼 */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`absolute top-6 right-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border active:scale-[0.98] ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 shadow-black/20"
            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 shadow-gray-100"
        }`}
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-500" />앱 다운로드
      </button>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h1
            className={`text-[33px] font-black tracking-tight mb-1 select-none ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            ZelonTrip 🏝️
          </h1>
          <p
            className={`text-[15px] font-medium ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}
          >
            내가 원하는 맞춤 AI 여행 플래너
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-9">
          <div className="space-y-5">
            {/* 이메일 입력 영역 */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-sm font-semibold pl-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
                className={`text-[15px] w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-60 font-medium ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* 비밀번호 입력 영역 */}
            <div className="flex flex-col space-y-2">
              <label
                className={`text-sm font-semibold pl-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
                className={`text-[15px] w-full h-12 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-60 font-medium ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500"
                    : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* 로그인 버튼 영역 */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isPending
                ? isDarkMode
                  ? "bg-gray-700 cursor-not-allowed shadow-none"
                  : "bg-gray-400 cursor-not-allowed shadow-none"
                : isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15"
            }`}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <span>로그인 중</span>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
            ) : (
              <span>로그인하기</span>
            )}
          </button>
        </form>

        {/* 하단 회원가입 유도 영역 */}
        <div className="flex items-center justify-center space-x-1.5 text-sm font-medium">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            아직 계정이 없으신가요?
          </span>
          <Link
            href="/signup"
            className={`font-semibold hover:underline hover:font-bold transition-colors ${
              isPending ? "pointer-events-none opacity-50" : ""
            } ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          >
            회원가입
          </Link>
        </div>
      </div>

      {/* 📱 2. 멀티 플랫폼 지원 앱 배포 모달 바디 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div
            className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center border transition-all transform scale-100 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-100 text-gray-900"
            }`}
          >
            {/* 우측 상단 닫기 X 버튼 */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full border transition-all ${
                isDarkMode
                  ? "border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  : "border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* 헤더 타이틀 */}
            <div className="text-center mt-2 mb-4">
              <h3 className="text-xl font-black tracking-tight mb-1">
                ZelonTrip 모바일 앱 🏝️
              </h3>
              <p
                className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                원하시는 모바일 운영체제를 선택해 주세요
              </p>
            </div>

            {/* 🔄 안드로이드 / iOS 분할 탭 세그먼트 제어기 */}
            <div
              className={`w-full flex p-1 rounded-xl mb-5 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "android"
                    ? isDarkMode
                      ? "bg-gray-800 text-white shadow-md"
                      : "bg-white text-gray-900 shadow-xs"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === "ios"
                    ? isDarkMode
                      ? "bg-gray-800 text-white shadow-md"
                      : "bg-white text-gray-900 shadow-xs"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                iOS (iPhone)
              </button>
            </div>

            {/* 🟢 탭 1: Android 활성화 시 랜더링 */}
            {activeTab === "android" && (
              <>
                <div className="w-52 h-52 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner border border-gray-100 mb-5 animate-fade-in">
                  <img
                    src="/QR/android_app_install.png"
                    alt="Android Build QR"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div
                  className={`w-full rounded-2xl p-4 text-[13px] font-medium space-y-2 border ${
                    isDarkMode
                      ? "bg-gray-900/50 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      지원 환경:
                    </span>
                    <span className="text-emerald-500 font-bold">
                      Android (APK)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      테스트 계정:
                    </span>
                    <span className="font-bold text-blue-500">
                      test@zelon.com
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className={isDarkMode ? "text-gray-400" : "text-gray-500"}
                    >
                      비밀번호:
                    </span>
                    <span className="font-bold text-blue-500">zelon1234</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed pt-1.5 border-t border-dashed ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}
                  >
                    * 폰 카메라로 스캔 후 다운로드 페이지에서 설치해 주세요.
                    (출처를 알 수 없는 앱 경고 발생 시 &apos;무시하고 설치&apos;
                    선택)
                  </p>
                </div>
              </>
            )}

            {/* 🍏 탭 2: iOS 활성화 시 랜더링 */}
            {activeTab === "ios" && (
              <div
                className={`w-full h-72 rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-dashed animate-fade-in ${
                  isDarkMode
                    ? "bg-gray-900/30 border-gray-700 text-gray-300"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <div className="text-4xl mb-4 select-none">⏳</div>
                <h4 className="text-sm font-bold text-blue-500 dark:text-blue-400 mb-2">
                  Apple 심사 진행 중...
                </h4>
                <p
                  className={`text-[12.5px] leading-relaxed max-w-[250px] ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  현재 앱이 TestFlight 심사를 거치는 중입니다.
                </p>
                <p
                  className={`text-[11px] mt-4 font-semibold px-2.5 py-1 rounded-md ${isDarkMode ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400"}`}
                >
                  iOS 앱 배포 중
                </p>
              </div>
            )}

            {/* 하단 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm mt-5 transition-all active:scale-[0.99]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
