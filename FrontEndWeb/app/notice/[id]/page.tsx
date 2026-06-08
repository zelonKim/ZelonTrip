"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Calendar } from "lucide-react";
import { client } from "@/api/client";

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

// 🎯 [FastAPI 통신 함수]
const fetchNoticeDetail = async (
  id: string | string[] | undefined,
): Promise<NoticeDetail | null> => {
  if (!id) return null;
  const response = await client.get(`/v1/notice/${id}`);
  return response.data;
};

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();

  // 💡 URL 세그먼트 경로에서 id 값 ([id] 폴더 매칭)을 추출합니다.
  const id = params?.id;

  const {
    data: notice,
    isLoading,
    isError,
    error,
  } = useQuery<NoticeDetail | null>({
    queryKey: ["noticeDetail", id],
    queryFn: () => fetchNoticeDetail(id),
    enabled: !!id,
  });

  // 1. 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col justify-center items-center px-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          공지사항을 읽어오는 중입니다...
        </p>
      </div>
    );
  }

  // 2. 에러 및 공지사항 부재 상태 UI
  if (isError || !notice) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col justify-center items-center px-6 text-center">
        <p className="text-red-500 font-medium text-base mb-4 whitespace-pre-line">
          공지사항을 불러오지 못했습니다.{"\n"}
          {error instanceof Error
            ? error.message
            : "존재하지 않는 공지사항입니다."}
        </p>
        <button
          onClick={() => router.push("/notice")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 pb-12">
      {/* 상단 네비게이션 헤더 바 */}
      <header className="flex items-center justify-between py-3 px-6 mb-6 border-b border-gray-200 bg-transparent">
        <button
          onClick={() => router.push("/notice")}
          className="w-10 h-10 flex items-center justify-start text-gray-900 hover:text-gray-600 transition-colors"
          title="공지사항 목록으로 이동"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-bold text-center flex-1 pr-10">
          공지사항 상세
        </h1>
      </header>

      {/* 🎯 최외각 div에 mx-auto를 추가하여 화면 가운데 정렬을 적용합니다 */}
      <div className="max-w-3xl px-4 mx-auto">
        {/* 메인 상세 본문 영역 */}
        <main>
          {/* 타이틀 및 메타 섹션 */}
          <div className="flex flex-col items-start space-y-3 mb-4">
            {/* 💡 중요 공지 플래그 참일 때 노출되는 배지 */}
            {notice.is_important && (
              <span className="px-2.5 py-1 text-[11px] font-bold text-red-500 bg-red-50 rounded-md select-none">
                중요
              </span>
            )}

            {/* 공지사항 제목 */}
            <h2 className="mt-6 text-xl font-extrabold text-gray-900 leading-snug tracking-tight">
              {notice.title}
            </h2>

            {/* 작성일 메타 데이터 로우 */}
            <div className="flex items-center space-x-1.5 text-xs font-medium text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* 중간 구분 선 */}
          <hr className="border-gray-200 my-4" />

          {/* 본문 텍스트 콘텐츠 영역 */}
          <div className="min-h-[200px] py-2">
            <p className="text-[15px] text-gray-700 leading-relaxed font-normal whitespace-pre-wrap break-all">
              {notice.content}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
