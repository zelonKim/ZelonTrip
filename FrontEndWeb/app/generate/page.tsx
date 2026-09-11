"use client";

import React, { useState } from "react";
import {
  Plane,
  Calendar,
  User,
  Compass,
  Users,
  Car,
  Gauge,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  COMPANION,
  COMPANION_OPTIONS,
  MBTI,
  MBTI_OPTIONS,
  TRANSPORT,
  TRANSPORT_OPTIONS,
} from "@/constants/options";
import { TENDENCY_TAGS, TRIP_STYLE_TAGS } from "@/constants/tags";
import { useWebPush } from "@/hooks/useWebPush";
import { useTripNotification } from "@/hooks/useSendNotification";
import { useGenerateTrip } from "@/hooks/useGenerateTrip";

export default function GeneratePage() {
  const { isDarkMode } = useTheme();

  const [location, setLocation] = useState("");
  const [days, setDays] = useState<number>(1);
  const [mbti, setMbti] = useState<MBTI | null>();
  const [tripStyle, setTripStyle] = useState("");
  const [tendency, setTendency] = useState("");
  const [asking, setAsking] = useState("");
  const [companion, setCompanion] = useState<COMPANION | null>();
  const [transportation, setTransportation] = useState<TRANSPORT | null>();
  const [pace, setPace] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  /////////////////////////////////////////////////////////////////////////////

  const { cachedPushToken } = useWebPush();

  const { mutate: NotificationMutation } = useTripNotification(cachedPushToken);

  /////////////////////////////////////////////////////////////////////////////

  const { mutate: tripGenerateMutation, isPending } = useGenerateTrip({
    onSuccess: (res) => {
      NotificationMutation({ planId: res.id, location });
      setLocation("");
    },
  });

  const handleGenerate = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location.trim()) return alert("여행지를 입력해 주세요.");
    if (!mbti) return alert("MBTI를 선택해 주세요.");
    if (!tripStyle) return alert("여행 스타일을 선택해 주세요.");
    if (!tendency) return alert("식당 성향을 선택해 주세요.");
    if (!companion) return alert("누구와 함께하는지 선택해 주세요.");
    if (!transportation) return alert("주요 이동 수단을 선택해 주세요.");

    tripGenerateMutation({
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

  /////////////////////////////////////////////////////////////////////////////


  return (
    <div
      className={`min-h-screen pb-10 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <form
        onSubmit={handleGenerate}
        className="max-w-4xl mx-auto px-4 pt-10 space-y-4"
      >
        <header
          className={`mb-6 border-b pb-4 ${isDarkMode ? "border-gray-800" : "border-transparent"}`}
        >
          <h1 className="text-2xl font-bold mb-1.5">AI 맞춤 여행 생성 ✨</h1>
          <p
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            취향 태그를 고르고 특별한 요청사항을 입력해 보세요.
          </p>
        </header>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Plane
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <label
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              여행지
            </label>
          </div>
          <input
            type="text"
            className={`w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-blue-500 transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="어디로 떠나시나요? (예: 도쿄, 뉴욕)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              여행 기간
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => setDays(Math.max(0, days - 1))}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              -
            </button>
            <span className="text-base font-semibold">
              {days === 0 ? "당일치기" : `${days}박 ${days + 1}일`}
            </span>
            <button
              type="button"
              onClick={() => setDays(days + 1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              +
            </button>
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <User
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              나의 MBTI
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {MBTI_OPTIONS.map((item) => {
              const isSelected = mbti === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMbti(item)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-900/60 border-blue-500 text-blue-400"
                        : "bg-blue-50 border-blue-600 text-blue-600"
                      : isDarkMode
                        ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm space-y-3 transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Compass
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              어떤 여행을 원하시나요? (중복 가능)
            </span>
          </div>

          <div>
            <p
              className={`text-xs font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              여행 스타일
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TRIP_STYLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      toggleTag(tag);
                      setTripStyle(tag);
                    }}
                    className={`text-sm px-3 py-2 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-blue-900/60 border-blue-500 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-600"
                        : isDarkMode
                          ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p
              className={`text-xs font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              식당 성향
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TENDENCY_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      toggleTag(tag);
                      setTendency(tag);
                    }}
                    className={`text-sm px-3 py-2 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-blue-900/60 border-blue-500 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-600"
                        : isDarkMode
                          ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`border-t my-4 ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
          />

          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles
              size={16}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              나만의 특별 요청사항 (선택)
            </span>
          </div>
          <textarea
            className={`w-full h-20 border rounded-xl p-3 text-sm outline-none focus:border-blue-500 resize-none transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="예: 교통이 편한 곳 위주로 관광 코스를 짜주세요."
            value={asking}
            onChange={(e) => setAsking(e.target.value)}
          />
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
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
                  className={`py-2.5 rounded-xl border text-sm font-medium text-center transition-all ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-900/60 border-blue-500 text-blue-400"
                        : "bg-blue-50 border-blue-600 text-blue-600"
                      : isDarkMode
                        ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Car
              size={20}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
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
                  className={`py-2.5 rounded-xl border text-sm font-medium text-center transition-all ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-900/60 border-blue-500 text-blue-400"
                        : "bg-blue-50 border-blue-600 text-blue-600"
                      : isDarkMode
                        ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-sm transition-colors ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Gauge
                size={20}
                className={isDarkMode ? "text-blue-400" : "text-blue-600"}
              />
              <span
                className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                여행 일정 페이스
              </span>
            </div>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pace} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={pace}
            onChange={(e) => setPace(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-colors ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>1 (여유)</span>
            <span>10 (빡빡)</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-4 rounded-2xl font-semibold text-white text-base shadow-md flex items-center justify-center gap-2 transition-all ${
            isPending
              ? "bg-gray-400 cursor-not-allowed"
              : isDarkMode
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
          }`}
        >
          {isPending ? (
            <>
              <span>여행 일정 생성 중</span>
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <span>여행 일정 생성하기 🤖</span>
          )}
        </button>
      </form>
    </div>
  );
}
