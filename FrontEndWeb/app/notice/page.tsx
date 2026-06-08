"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, RotateCw, Megaphone } from "lucide-react";
import { client } from "@/api/client";

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const fetchNotices = async (): Promise<Notice[]> => {
  const response = await client.get("/v1/notice");
  return response.data;
};

export default function NoticePage() {
  const router = useRouter();

  const {
    data: notices,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: fetchNotices,
  });

  // 수동 새로고침 핸들러
  const handleRefresh = async () => {
    await refetch();
  };

  // 1. 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center px-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          공지사항을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  // 2. 에러 상태 UI
  if (isError) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center px-6 text-center">
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

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 pb-12">
      <header className="flex items-center justify-between py-3 px-6 mb-5 border-b border-gray-200 bg-transparent">
        <button
          onClick={() => router.push("/mypage")}
          className="w-10 h-10 flex items-center justify-start text-gray-900 hover:text-gray-600 transition-colors"
          title="마이페이지로 이동"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold text-center flex-1 pr-2">
          공지사항 📢
        </h1>

        {/* 🎯 [웹 최적화 포인트] 모바일 당겨서 새로고침(RefreshControl) 대신 직관적인 수동 동기화 회전 버튼 배치 */}
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-60"
          title="새로고침"
        >
          <RotateCw
            className={`w-4 h-4 text-gray-500 ${isRefetching ? "animate-spin" : ""}`}
          />
        </button>
      </header>

      <div className="max-w-2xl mx-auto ">
        <main>
          {notices && notices.length > 0 ? (
            <ul className="space-y-4">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <div
                    onClick={() => router.push(`/notice/${notice.id}`)}
                    className="w-full text-left block p-5 rounded-2xl border border-gray-200 border-b-[3px] border-b-gray-300 bg-white shadow-sm hover:scale-[1.01] hover:border-gray-300 transition-all cursor-pointer"
                  >
                    {/* 카드 상단: 작성 날짜 */}
                    <div className="flex justify-end mb-1">
                      <span className="text-xs text-gray-400 font-medium">
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

                    {/* 카드 중단: 공지 제목 */}
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1.5">
                      {notice.title}
                    </h3>

                    {/* 카드 하단: 본문 미리보기 서머리 */}
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /* 텅 비어있는 공지사항 예외 상태 UI */
            <div className="flex flex-col items-center justify-center pt-24 text-gray-400 gap-3">
              <Megaphone className="w-10 h-10 text-gray-300 stroke-[1.5]" />
              <p className="text-sm font-medium">등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
