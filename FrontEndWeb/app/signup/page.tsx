"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignup } from "@/hooks/useSignup";
import { useTheme } from "@/context/ThemeContext";

export default function SignupPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate: signupMutation, isPending: isSignupPending } = useSignup();

  const handleSignup = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !passwordConfirm)
      return alert("모든 정보를 입력해주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert("올바른 이메일 형식이 아닙니다.");
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password))
      return alert("비밀번호는 영문+숫자 8자 이상입니다.");
    if (password !== passwordConfirm)
      return alert("비밀번호가 일치하지 않습니다.");

    signupMutation({
      username: email,
      password,
      password_confirm: passwordConfirm,
    });
  };

  ////////////////////////////////////////////////////////

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="mb-8">
          <h1
            className={`text-2xl font-extrabold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            AI와 함께 떠나요! ✈️
          </h1>
          <p
            className={`text-md ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            ZelonTrip과 함께 여행을 시작해볼까요?
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              이메일
            </label>
            <input
              type="email"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              비밀번호
            </label>
            <input
              type="password"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="영문+숫자 조합 8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="비밀번호를 다시 입력해주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <button
            type="submit"
            disabled={isSignupPending}
            className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-white font-bold text-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isSignupPending ? "가입 중..." : "시작하기"}
          </button>
        </form>

        <p
          className={`text-center text-sm font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-500 font-semibold hover:underline hover:font-bold"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
