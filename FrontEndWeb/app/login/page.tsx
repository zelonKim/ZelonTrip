"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { client } from "@/api/client";
import SecureLS from "secure-ls";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="min-h-screen w-full bg-white flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center mb-10">
          <h1 className="text-[32px] font-black text-blue-600 tracking-tight mb-1 select-none">
            ZelonTrip 🏝️
          </h1>
          <p className="text-[15px] font-medium text-gray-500 ">
            내가 원하는 맞춤 AI 여행 플래너
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-9">
          <div className="space-y-5">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700 pl-0.5">
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
                className="text-[15px] w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-gray-700 pl-0.5">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                required
                className="text-[15px] w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full h-14 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
              isPending
                ? "bg-gray-400 cursor-not-allowed shadow-none"
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
          <span className="text-gray-500">아직 계정이 없으신가요?</span>
          <Link
            href="/signup"
            className={`text-blue-600 font-semibold hover:text-blue-700 hover:underline hover:font-bold transition-colors ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
