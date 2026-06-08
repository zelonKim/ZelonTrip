"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CircleUser, CalendarSearch, Bot } from "lucide-react";

export default function MenuTabBar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "홈",
      href: "/",
      icon: Home,
      size: 25,
      strokeWidth: (active: boolean) => (active ? 2.5 : 2),
    },
    {
      name: "여행 생성",
      href: "/generate",
      icon: Bot,
      size: 30,
      strokeWidth: (active: boolean) => (active ? 2.3 : 2),
    },
    {
      name: "일정 조회",
      href: "/plans",
      icon: CalendarSearch,
      size: 25,
      strokeWidth: (active: boolean) => (active ? 2.5 : 2),
    },
    {
      name: "마이페이지",
      href: "/mypage",
      icon: CircleUser,
      size: 25,
      strokeWidth: (active: boolean) => (active ? 2.5 : 2),
    },
  ];

  // 💡 상세 페이지나 AI 답변 등 하단 탭바를 숨겨야 하는 웹 주소 예외 처리
  // Expo에서 href: null 로 줬던 화면들에 대응합니다.
  const hiddenPaths = ["/plan/", "/answer", "/notice", "/login"];
  const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) return null;

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t xl:px-12 flex justify-around items-center h-16 safe-bottom transition-colors mx-auto ${"bg-white border-gray-200 text-gray-500"}`}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors"
          >
            <Icon
              size={item.size}
              strokeWidth={item.strokeWidth(isActive)}
              className={isActive ? "text-blue-600" : "text-gray-400"}
            />

            <span
              className={`text-[10px] mt-0.5 ${isActive ? "font-semibold text-blue-600" : ""}`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
