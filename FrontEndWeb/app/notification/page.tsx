"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2, MessageSquare } from "lucide-react";
import { messaging } from "@/services/notifications"; // 💡 FCM 메시징 인스턴스 가져오기
import { onMessage } from "firebase/messaging";
import { useTheme } from "@/context/ThemeContext"; // 🎯 1. 전역 테마 훅 가져오기

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  planId: string | null;
}

export default function NotificationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme(); // 🎯 2. 다크모드 상태 구독
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 로컬 스토리지에서 알림 히스토리 로드
  const loadNotifications = () => {
    try {
      const data = localStorage.getItem("zelontrip_notifications");
      if (data) {
        setNotifications(JSON.parse(data));
      }
    } catch (error) {
      console.error("알림 로드 실패:", error);
    }
  };

  // 특정 알림 개별 삭제
  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedList = notifications.filter((item) => item.id !== id);
    setNotifications(updatedList);
    localStorage.setItem(
      "zelontrip_notifications",
      JSON.stringify(updatedList),
    );
  };

  // 전체 알림 삭제
  const clearAllNotifications = () => {
    if (window.confirm("모든 알림을 삭제하시겠습니까?")) {
      setNotifications([]);
      localStorage.removeItem("zelontrip_notifications");
    }
  };

  useEffect(() => {
    loadNotifications();

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("알림함 화면에서 포그라운드 실시간 캐치:", payload);

        if (payload.notification) {
          const newNoti: NotificationItem = {
            id: payload.messageId || `noti_${Date.now()}`,
            title: payload.notification.title || "새로운 알림",
            body: payload.notification.body || "",
            date: new Date().toISOString(),
            planId: payload.data?.planId || null,
          };

          setNotifications((prev) => {
            const updated = [newNoti, ...prev];
            localStorage.setItem(
              "zelontrip_notifications",
              JSON.stringify(updated),
            );
            return updated;
          });
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <div
      className={`min-h-screen pb-12 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto">
        {/* 커스텀 상단 헤더 내비게이션 바 */}
        <header
          className={`flex justify-between items-center h-12 px-4 py-8 border-b transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <button
            onClick={() => router.back()}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-200"
                : "hover:bg-gray-100 text-gray-800"
            }`}
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>

          <h1 className="text-xl font-bold">알림함 🔔</h1>

          {notifications.length > 0 ? (
            <button
              onClick={clearAllNotifications}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              전체 삭제
            </button>
          ) : (
            <div className="w-12" />
          )}
        </header>

        {/* 알림 리스트 렌더링 영역 */}
        <main className="flex flex-col items-center justify-center px-4">
          {notifications.length > 0 ? (
            notifications.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString(
                "ko-KR",
                {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.planId) {
                      router.push(`/plan/${item.planId}`);
                    }
                  }}
                  className={`p-4 mt-5 w-full sm:max-w-md lg:max-w-lg xl:max-w-xl border rounded-2xl shadow-sm transition-all ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } ${
                    item.planId
                      ? isDarkMode
                        ? "cursor-pointer hover:border-blue-500 hover:shadow-md"
                        : "cursor-pointer hover:border-blue-400 hover:shadow-md"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isDarkMode
                            ? "bg-blue-950/50 text-blue-400"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <MessageSquare size={16} />
                      </div>
                      <span
                        className={
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }
                      >
                        {formattedDate}
                      </span>
                    </div>

                    <button
                      onClick={(e) => deleteNotification(e, item.id)}
                      className={`p-1 rounded-md transition-colors ${
                        isDarkMode
                          ? "text-gray-500 hover:text-red-400 hover:bg-gray-700"
                          : "text-gray-400 hover:text-red-500 hover:bg-gray-50"
                      }`}
                      aria-label="알림 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3
                    className={`text-base font-bold mb-1 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {item.body}
                  </p>
                </div>
              );
            })
          ) : (
            /* 알림이 없을 때의 Empty 컴포넌트 */
            <div
              className={`flex flex-col items-center justify-center min-h-[500px] ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
            >
              <p className="font-medium">도착한 알림이 없습니다.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
