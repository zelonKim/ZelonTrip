"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, RotateCw, Megaphone } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { Notice } from "@/types/Notice";
import { getNotices } from "@/api/notice/getNotices";

export default function NoticePage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const {
    data: notices,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: getNotices,
  });

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col justify-center items-center px-6 transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p
          className={`mt-4 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          공지사항을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`min-h-screen w-full flex flex-col justify-center items-center px-6 text-center transition-colors duration-200 ${
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <p className="text-red-500 font-medium text-base mb-4 whitespace-pre-line">
          공지사항을 불러오지 못했습니다.{"\n"}
          {error instanceof Error ? error.message : "다시 시도해 주세요."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  ////////////////////////////////////////////////////////////////////////////

  return (
    <div
      className={`min-h-screen w-full pb-12 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <header
        className={`flex items-center justify-between py-3 px-6 mb-5 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={() => router.push("/mypage")}
          className={`w-10 h-10 flex items-center justify-start transition-colors ${
            isDarkMode
              ? "text-gray-200 hover:text-gray-400"
              : "text-gray-900 hover:text-gray-600"
          }`}
          title="마이페이지로 이동"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-center flex-1 pr-2">
          공지사항 📢
        </h1>

        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-sm disabled:opacity-60 ${
            isDarkMode
              ? "bg-gray-800 border-gray-600 hover:bg-gray-600"
              : "bg-white border-gray-200 hover:bg-gray-100"
          }`}
          title="새로고침"
        >
          <RotateCw
            className={`w-4 h-4 text-gray-500 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        <main>
          {notices && notices.length > 0 ? (
            <ul className="space-y-4">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <div
                    onClick={() => router.push(`/notice/${notice.id}`)}
                    className={`w-full text-left block p-5 rounded-2xl border border-b-[3px] shadow-sm hover:scale-[1.01] transition-all cursor-pointer ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 border-b-gray-700 hover:border-gray-600 "
                        : "bg-white border-gray-200 border-b-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-end mb-1">
                      <span
                        className={`text-xs font-medium ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {new Date(notice.created_at).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold line-clamp-1 mb-1.5 ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {notice.title}
                    </h3>

                    <p
                      className={`text-sm line-clamp-2 leading-relaxed ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {notice.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center pt-24 text-gray-400 gap-3">
              <Megaphone
                className={
                  isDarkMode ? "text-gray-600" : "text-gray-300 stroke-[1.5]"
                }
              />
              <p
                className={`text-sm font-medium ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                등록된 공지사항이 없습니다.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
