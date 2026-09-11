"use client";
import React, { useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLogin } from "@/hooks/useLogin";
import { AppDownloadModal } from "@/component/AppDownloadModal";

export default function LoginPage() {
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: loginMutation, isPending } = useLogin();

  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    loginMutation({ email, password });
  };

  /////////////////////////////////////////////////////////////////

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col justify-center items-center px-6 py-12 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`absolute top-6 right-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border active:scale-[0.98] ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 shadow-black/20"
            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 shadow-gray-100"
        }`}
      >
        <Smartphone className="w-3.5 h-3.5  text-blue-500" />앱 다운로드
      </button>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h1
            className={`text-[33px] font-black tracking-tight mb-1 select-none ${
              isDarkMode ? "text-blue-500" : "text-blue-600"
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

      <AppDownloadModal
        isOpen={isModalOpen}
        isDarkMode={isDarkMode}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
