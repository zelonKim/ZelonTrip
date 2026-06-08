"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Award,
  Footprints,
  Megaphone,
  MessageSquare,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import SecureLS from "secure-ls";
import { client } from "@/api/client";

const ls =
  typeof window !== "undefined" ? new SecureLS({ encodingType: "aes" }) : null;

export default function MyPagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPendingDeactivate, startTransition] = useTransition();

  // 모달 제어 상태 관리
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputNickname, setInputNickname] = useState("");

  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // 1. 피드백 전송 Mutation
  const feedbackMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await client.post("/v1/user/feedback", { content });
      return response.data;
    },
    onSuccess: () => {
      alert("✅ 접수 완료: 피드백이 성공적으로 접수되었습니다!");
      setIsFeedbackModalVisible(false);
      setFeedbackText("");
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail ||
        "피드백 전송에 실패했습니다. 다시 시도해 주세요.";
      alert(`오류: ${errMsg}`);
    },
  });

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFeedback = feedbackText.trim();
    if (!trimmedFeedback) {
      alert("안내: 피드백 내용을 입력해 주세요.");
      return;
    }
    feedbackMutation.mutate(trimmedFeedback);
  };

  // 2. 유저 프로필 조회 Query
  const { data: userData, isPending: isUserPending } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/auth/me");
      return response.data;
    },
  });

  // 3. 여행 통계 조회 Query
  const { data: statsData, isPending: isStatsPending } = useQuery({
    queryKey: ["userTripStats"],
    queryFn: async () => {
      const response = await client.get("/v1/user/stats");
      return response.data;
    },
  });

  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      try {
        // 💡 secure-ls로 암호화되어 저장된 토큰을 안전하게 삭제합니다.
        if (ls) {
          ls.remove("userToken");
        } else {
          localStorage.removeItem("userToken"); // 방어용 백업
        }

        queryClient.clear();
        router.replace("/login");
      } catch (error) {
        alert("안내: 로그아웃 처리 중 오류가 발생했습니다.");
      }
    }
  };

  // 5. 회원 탈퇴 처리
  const handleDeactivate = () => {
    if (
      window.confirm(
        "회원 탈퇴\n\n정말 탈퇴하시겠습니까?\n탈퇴 시 서비스 이용이 제한됩니다.",
      )
    ) {
      startTransition(async () => {
        try {
          await client.patch("/v1/auth/deactivate");

          if (ls) {
            ls.remove("userToken");
          } else {
            localStorage.removeItem("userToken");
          }

          queryClient.clear();
          alert("안내: 그동안 서비스를 이용해 주셔서 감사합니다.");
          router.replace("/login");
        } catch (error: any) {
          const errMsg =
            error.response?.data?.detail || "서버 통신에 실패했습니다.";
          alert(`탈퇴 실패: ${errMsg}`);
        }
      });
    }
  };
  const openNicknameModal = () => {
    setInputNickname(userData?.nickname || "");
    setIsModalVisible(true);
  };

  // 6. 닉네임 수정 Mutation
  const nicknameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      const response = await client.patch("/v1/user/nickname", {
        nickname: newNickname,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUserProfile"], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, nickname: data.nickname };
      });

      alert("성공: 닉네임이 성공적으로 설정되었습니다.");
      setIsModalVisible(false);
      setInputNickname("");
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail || "닉네임 저장에 실패했습니다.";
      alert(`오류: ${errMsg}`);
    },
  });

  const handleSaveNickname = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNickname = inputNickname.trim();
    if (!trimmedNickname) {
      alert("안내: 닉네임을 입력해 주세요.");
      return;
    }
    nicknameMutation.mutate(trimmedNickname);
  };

  return (
    <div className="min-w-screen min-h-screen w-full bg-gray-50 text-gray-900">
      {/* 메인 레이아웃 컨테이너 */}
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        {/* 헤더 영역 */}
        <header className="pb-4 mb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
        </header>

        {/* 본문 콘텐츠 */}
        <main className="space-y-5">
          {/* 👣 [1. 프로필 & 취향 배지 영역] */}
          <section className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <User className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                {isUserPending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mt-1" />
                ) : (
                  <div className="flex flex-col">
                    {userData?.nickname ? (
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg font-bold truncate">
                          {userData.nickname}
                        </span>
                        <button
                          onClick={openNicknameModal}
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          닉네임 수정하기
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={openNicknameModal}
                        className="px-3 py-1.5 rounded-lg border text-sm font-semibold text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 self-start mb-1 transition-colors"
                      >
                        닉네임 만들기 ✏️
                      </button>
                    )}
                    <span className="text-sm font-medium truncate text-gray-500">
                      {userData?.username}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            {/* AI 취향 페르소나 배지 라인 */}
            <div className="w-full">
              <div className="flex items-center space-x-1.5 mb-3 text-sm font-semibold text-gray-500">
                <Award className="w-4 h-4" />
                <span>취득한 뱃지</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div className="px-3 py-1.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 text-xs font-semibold">
                  {isStatsPending
                    ? "⏳ 분석 중..."
                    : (statsData?.total_location ?? 0) >= 5
                      ? "✈️ 프로 여행러"
                      : (statsData?.total_location ?? 0) >= 2
                        ? "👟 중급 여행러"
                        : "🐣 초보 여행러"}
                </div>

                {(statsData?.total_days ?? 0) > 0 && (
                  <div className="px-3 py-1.5 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 text-xs font-semibold">
                    ⏱️ 누적 {statsData?.total_days}일째 여행 중
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 👣 [2. 여행 발자국 영역] */}
          <section className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-start space-x-3">
            <div className="flex flex-col flex-1">
              <div className="flex items-center space-x-1.5 mb-1 text-sm font-semibold text-gray-500">
                <Footprints className="w-4 h-4" />
                <span>나의 여행 발자국</span>
              </div>

              {isStatsPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 mt-2" />
              ) : (
                <p className="text-sm mt-1 leading-relaxed text-gray-600">
                  지금까지 ZelonTrip과 함께{" "}
                  <span className="text-blue-600 font-bold">
                    {statsData?.total_location ?? 0}개
                  </span>
                  의 여행지를 탐방했어요!
                </p>
              )}
            </div>
          </section>

          {/* ⚙️ [3. 앱 지원 메뉴] */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold pl-0.5 text-gray-500">
              앱 지원
            </h2>

            <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-sm overflow-hidden">
              {/* 공지사항 링크 */}
              <button
                onClick={() => router.push("/notice")}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] font-medium">공지사항</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* 피드백 보내기 링크 */}
              <button
                onClick={() => setIsFeedbackModalVisible(true)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] font-medium">피드백 보내기</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </section>

          {/* 🔒 [4. 계정 관리] */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              로그아웃
            </button>
            <span className="text-gray-200 select-none">|</span>
            <button
              onClick={handleDeactivate}
              disabled={isPendingDeactivate}
              className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {isPendingDeactivate ? "탈퇴 중..." : "회원탈퇴"}
            </button>
          </div>

          {/* 서비스 버전 표시 */}
          <p className="text-xs text-center font-medium text-gray-400 pt-1">
            버전 정보 v1.0.0 (최신 버전)
          </p>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 🔮 [모달 1] 닉네임 변경 다이얼로그 오버레이 */}
      {/* ========================================================================= */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl bg-white text-gray-900 transform transition-all">
            <h3 className="text-lg font-bold mb-1.5">닉네임 설정</h3>
            <p className="text-xs mb-4 text-gray-500">
              새로운 닉네임을 입력해 주세요.
            </p>

            <form onSubmit={handleSaveNickname} className="space-y-5">
              <input
                type="text"
                value={inputNickname}
                onChange={(e) => setInputNickname(e.target.value)}
                maxLength={15}
                autoFocus
                placeholder="닉네임 입력"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-[15px] bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              />

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsModalVisible(false)}
                  disabled={nicknameMutation.isPending}
                  className="flex-1 h-11 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={nicknameMutation.isPending}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {nicknameMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔮 [모달 2] 피드백 보내기 다이얼로그 오버레이 */}
      {/* ========================================================================= */}
      {isFeedbackModalVisible && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl bg-white text-gray-900 transform transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">💬 피드백 보내기</h3>
              <button
                onClick={() => {
                  setIsFeedbackModalVisible(false);
                  setFeedbackText("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-center leading-relaxed mb-4 text-gray-500">
              ZelonTrip을 이용하면서 좋았던 점이나 <br /> 불편했던 점을 자유롭게
              작성해주세요.
            </p>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                maxLength={300}
                rows={4}
                autoFocus
                placeholder="여기에 내용을 입력해 주세요 (최대 300자)"
                className="w-full p-3.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              />

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsFeedbackModalVisible(false);
                    setFeedbackText("");
                  }}
                  disabled={feedbackMutation.isPending}
                  className="flex-1 h-11 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={feedbackMutation.isPending}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {feedbackMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "보내기"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
