"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plane,
  Calendar,
  User,
  Compass,
  Users,
  Car,
  Gauge,
  Sparkles,
} from "lucide-react";
import { client } from "@/api/client";

const MBTI_OPTIONS = [
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];
const COMPANION_OPTIONS = [
  "혼자",
  "친구와",
  "연인과",
  "가족과",
  "아이와",
  "부모님과",
];
const TRANSPORT_OPTIONS = ["대중교통", "자차/렌트카", "도보", "자전거"];

const TRIP_STYLE_TAGS = [
  "🎯 명소 탐방",
  "☕️ 힙한 카페 투어",
  "🌿 힐링·자연",
  "🏃 액티비티·체험",
  "🛍️ 쇼핑 중심",
  "📸 인스타 감성",
  "🎨 전시·문화",
];
const TENDENCY_TAGS = [
  "💸 가성비 중시",
  "👑 럭셔리·호캉스",
  "🍺 음주 가능",
  "🤫 숨겨진 맛집",
  "🛌 깔끔한 숙소 필수",
];

export default function GeneratePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [location, setLocation] = useState("");
  const [days, setDays] = useState<number>(1);
  const [mbti, setMbti] = useState("");
  const [tripStyle, setTripStyle] = useState("");
  const [tendency, setTendency] = useState("");
  const [asking, setAsking] = useState("");
  const [companion, setCompanion] = useState("");
  const [transportation, setTransportation] = useState("");
  const [pace, setPace] = useState<number>(5);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string, type: "style" | "tendency") => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      if (type === "style") setTripStyle("");
      if (type === "tendency") setTendency("");
    } else {
      setSelectedTags([...selectedTags, tag]);
      if (type === "style") setTripStyle(tag);
      if (type === "tendency") setTendency(tag);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await client.post("/v1/trip/generate", requestData);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      queryClient.invalidateQueries({ queryKey: ["tripDetail", res.id] });
      queryClient.invalidateQueries({ queryKey: ["userTripStats"] });
      queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });

      if (
        confirm(
          "일정 생성 완료 🎉\nAI가 여행 일정 생성을 완료하였습니다. 확인하러 가시겠습니까?",
        )
      ) {
        router.push(`/plan/${res.id}`);
      }
    },
    onError: () => {
      alert("일정 생성 중 문제가 발생했습니다. 다시 시도해 주세요.");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) return alert("여행지를 입력해 주세요.");
    if (!mbti) return alert("MBTI를 선택해 주세요.");
    if (!tripStyle) return alert("여행 스타일을 선택해 주세요.");
    if (!tendency) return alert("식당 및 숙소 성향을 선택해 주세요.");
    if (!companion) return alert("누구와 함께하는지 선택해 주세요.");
    if (!transportation) return alert("주요 이동 수단을 선택해 주세요.");

    mutate({
      location,
      days,
      mbti,
      tripStyle,
      tendency,
      asking,
      companion,
      transportation,
      pace,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-10">
      <form
        onSubmit={handleGenerate}
        className=" mx-auto sm:px-12 md:px-24 lg:px-36 xl:px-48 pt-10"
      >
        {/* 헤더 섹션 */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
            AI 맞춤 여행 생성 ✨
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            취향 태그를 고르고 특별한 요청사항을 입력해 보세요.
          </p>
        </header>

        {/* 1. 목적지 입력 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Plane size={20} className="text-blue-600" />
            <label className="text-sm font-semibold text-gray-700">
              여행지
            </label>
          </div>
          <input
            type="text"
            className="w-full h-11 border border-gray-300 rounded-xl px-3 text-sm bg-white text-gray-900 outline-none focus:border-blue-500"
            placeholder="어디로 떠나시나요? (예: 도쿄, 뉴욕)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* 2. 여행 기간 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              여행 기간
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => setDays(Math.max(0, days - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold"
            >
              -
            </button>
            <span className="text-base font-semibold">
              {days === 0 ? "당일치기" : `${days}박 ${days + 1}일`}
            </span>
            <button
              type="button"
              onClick={() => setDays(days + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. MBTI 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <User size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              나의 MBTI
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x no-scrollbar">
            {MBTI_OPTIONS.map((item) => {
              const isSelected = mbti === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMbti(item)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors snap-start ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-600"
                      : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 여행 취향 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Compass size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              어떤 여행을 원하시나요?
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-600 mt-3 mb-2">
            여행 스타일
          </p>
          <div className=" flex flex-wrap gap-1.5 w-full">
            {TRIP_STYLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, "style")}
                  className={`text-sm px-3 py-2 rounded-lg  font-medium transition-colors border ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-600"
                      : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-gray-600 mt-4 mb-2">
            식당 · 숙소 성향
          </p>
          <div className="flex flex-wrap gap-1.5 w-full">
            {TENDENCY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, "tendency")}
                  className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors border ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-600"
                      : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <hr className="my-4 border-gray-200" />

          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              나만의 특별 요청사항 (선택)
            </span>
          </div>
          <textarea
            className="w-full h-20 border border-gray-300 rounded-xl p-3 text-sm bg-white text-gray-900 outline-none focus:border-blue-500 resize-none"
            placeholder="예: 교통이 편한 곳 위주로 관광 코스를 짜주세요."
            value={asking}
            onChange={(e) => setAsking(e.target.value)}
          />
        </div>

        {/* 5. 동반자 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              누구와 함께하나요?
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {COMPANION_OPTIONS.map((item) => {
              const isSelected = companion === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCompanion(item)}
                  className={`py-3 rounded-xl border text-sm font-medium text-center transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-600"
                      : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. 이동 수단 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Car size={20} className="text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">
              주요 이동 수단
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TRANSPORT_OPTIONS.map((item) => {
              const isSelected = transportation === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTransportation(item)}
                  className={`py-3 rounded-xl border text-sm font-medium text-center transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-600 text-blue-600"
                      : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. 일정 페이스 선택 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge size={20} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                여행 일정 페이스
              </span>
            </div>
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pace} / 10
            </span>
          </div>
          <div className="w-full my-2">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={pace}
              onChange={(e) => setPace(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1 px-1">
              <span>1 (여유)</span>
              <span>10 (빡빡)</span>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-4 rounded-2xl font-semibold text-white text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
            isPending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
          }`}
        >
          {isPending ? (
            <>
              <span>여행 일정 생성 중</span>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            <span>여행 일정 생성하기 🤖</span>
          )}
        </button>
      </form>
    </div>
  );
}
