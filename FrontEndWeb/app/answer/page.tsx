"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { client } from "@/api/client";
import { useTheme } from "@/context/ThemeContext";

interface AIAnswerResponse {
  keyword: string;
  content: string;
  imageUrl: string;
}

const fetchAIAnswer = async (keyword: string | null) => {
  if (!keyword) return null;
  const response = await client.post("/v1/location/ask", { keyword });
  return response.data;
};

function AnswerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyword = searchParams.get("keyword");

  const { data: aiAnswer, isPending } = useQuery<AIAnswerResponse | null>({
    queryKey: ["aiAnswer", keyword],
    queryFn: () => fetchAIAnswer(keyword),
    enabled: !!keyword,
  });

  const { isDarkMode } = useTheme();

  // 로딩 상태 UI
  if (isPending) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col justify-center items-center px-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-base font-medium text-gray-500 text-center leading-relaxed">
          AI가 <span className="font-bold">{keyword}</span> 여행 정보를
          <br />
          가져오고 있어요.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full pb-8 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-3xl mx-auto relative sm:px-0">
        {/* 1. 상단 대표 랜드마크 이미지 영역 */}
        <div className="relative w-full h-[300px] overflow-hidden">
          <img
            src={
              aiAnswer?.imageUrl ||
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            }
            alt={keyword || "여행지 이미지"}
            className="w-full h-full object-cover"
          />
          {/* 이미지 보정용 딤 오버레이 */}
          <div className="absolute inset-0 bg-black/35" />

          {/* 고정 뒤로가기 버튼 */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-5 left-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center text-white z-10"
            title="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* 타이틀 텍스트 레이어 */}
          <div className="absolute bottom-8 left-5 right-5 text-white">
            <span className="text-xs font-semibold text-gray-200 block mb-1 drop-shadow-sm">
              AI 맞춤 여행 가이드
            </span>
            <h1 className="text-3xl font-black tracking-wide drop-shadow-md truncate">
              {keyword}
            </h1>
          </div>
        </div>

        {/* 2. 하단 텍스트 가이드북 내용 영역 */}
        <div className="px-1 -mt-4 relative z-10">
          <div
            className={`rounded-2xl border p-6 shadow-sm space-y-5 transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {/* 카드 내부 헤더 */}
            <div
              className={`flex items-center space-x-2 border-b pb-3 ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <span className="text-xl">🤖</span>
              <h2
                className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                AI의 특별 가이드
              </h2>
            </div>

            {/* 마크다운 렌더러 (prose-invert 추가) */}
            <article
              className={`prose prose-sm max-w-none leading-relaxed ${
                isDarkMode ? "prose-invert text-gray-300" : "text-gray-700"
              } prose-headings:font-bold prose-headings:text-gray-900 prose-strong:font-bold`}
            >
              <ReactMarkdown>
                {aiAnswer?.content || "가이드 내용을 불러오지 못했습니다."}
              </ReactMarkdown>
            </article>
          </div>

          {/* 하단 홈으로 이동 버튼 */}
          <button
            onClick={() => router.push("/")}
            className="mt-5 w-full h-13 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 transition-all"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnswerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <AnswerContent />
    </Suspense>
  );
}
