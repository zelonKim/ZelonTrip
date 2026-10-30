"use client";
import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTheme } from "@/context/ThemeContext";
import { LocationAnswerResponse } from "@/types/LocationAnswer";
import { getLocationAnswer } from "@/api/location/getLocationAnswer";
import { useAnswerLanguage } from "@/hooks/languages/useAnswerLanguage";

function AnswerContent() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useAnswerLanguage(); 

  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");

  const { data: locationAnswer, isPending: isAnswerPending } =
    useQuery<LocationAnswerResponse>({
      queryKey: ["aiAnswer", keyword],
      queryFn: () => getLocationAnswer(keyword),
      enabled: !!keyword,
    });

  if (isAnswerPending) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col justify-center items-center px-6 transition-colors ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p
          className={`mt-4 text-base font-medium text-center leading-relaxed ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t.loadingPrefix}
          <span className="font-bold">{keyword}</span>
          {t.loadingSuffix}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full pb-8 transition-colors ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-3xl mx-auto relative sm:px-0">
        <div className="relative w-full h-[300px] overflow-hidden">
          <img
            src={
              locationAnswer?.imageUrl ||
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
            }
            alt={keyword || t.defaultImageAlt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />

          <button
            onClick={() => router.push("/")}
            className="cursor-pointer absolute top-5 left-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 transition-colors flex items-center justify-center text-white z-10"
            title={t.backTooltip}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="absolute bottom-8 left-5 right-5 text-white">
            <span className="text-xs font-semibold text-gray-200 block mb-1 drop-shadow-sm">
              {t.guideSubtitle}
            </span>
            <h1 className="text-3xl font-black tracking-wide drop-shadow-md truncate">
              {keyword}
            </h1>
          </div>
        </div>

        <div className="px-1 -mt-4 relative z-10">
          <div
            className={`rounded-2xl border p-6 shadow-sm space-y-5 transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`flex items-center space-x-2 border-b pb-3 ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <span className="text-xl">🤖</span>
              <h2
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.aiGuideTitle}
              </h2>
            </div>

            <article
              className={`prose prose-sm max-w-none leading-relaxed ${
                isDarkMode ? "prose-invert text-gray-300" : "text-gray-700"
              } prose-headings:font-bold prose-headings:text-gray-900 prose-strong:font-bold`}
            >
              <ReactMarkdown>
                {locationAnswer?.content || t.defaultContent}
              </ReactMarkdown>
            </article>
          </div>

          <button
            onClick={() => router.push("/")}
            className="cursor-pointer mt-5 w-full h-13 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10 transition-all"
          >
            {t.homeButton}
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
