"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";

interface SignUpData {
  username: string;
  password: string;
  password_confirm: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SignUpData) => client.post("/v1/auth/signup", data),
    onSuccess: () => {
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      router.push("/login");
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "회원가입에 실패했습니다.");
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사 로직 (기존과 동일)
    if (!email || !password || !passwordConfirm)
      return alert("모든 정보를 입력해주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert("올바른 이메일 형식이 아닙니다.");
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password))
      return alert("비밀번호는 영문+숫자 8자 이상입니다.");
    if (password !== passwordConfirm)
      return alert("비밀번호가 일치하지 않습니다.");

    mutate({ username: email, password, password_confirm: passwordConfirm });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            AI와 함께 떠나요! ✈️
          </h1>
          <p className="text-gray-500 text-md">
            ZelonTrip과 함께 여행을 시작해볼까요?
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              className="w-full text-[15px] rounded-xl bg-gray-100 p-3 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              className="w-full  text-[15px] rounded-xl bg-gray-100 p-3 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="영문+숫자 조합 8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              type="password"
              className="w-full text-[15px] rounded-xl bg-gray-100 p-3 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="비밀번호를 다시 입력해주세요"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-3 w-full rounded-xl bg-blue-600 py-3 text-white font-bold text-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isPending ? "가입 중..." : "시작하기"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm font-medium">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 font-semibold hover:underline hover:font-bold"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
