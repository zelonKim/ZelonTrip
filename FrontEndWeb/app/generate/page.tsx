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
  COMPANION_LABELS,
  COMPANION_OPTIONS,
  MBTI,
  MBTI_OPTIONS,
  TRANSPORT,
  TRANSPORT_LABELS,
  TRANSPORT_OPTIONS,
} from "@/constants/options";
import {
  TENDENCY_TAGS,
  TENDENCY_TRANSLATIONS,
  TRIP_STYLE_TAGS,
  TRIP_STYLE_TRANSLATIONS,
} from "@/constants/tags";
import { useWebPush } from "@/hooks/useWebPush";
import { useTripNotification } from "@/hooks/useSendNotification";
import { useGenerateTrip } from "@/hooks/useGenerateTrip";
import { useGenerateLanguage } from "@/hooks/languages/useGenerateLanguage";

export default function GeneratePage() {
  const { isDarkMode } = useTheme();
  const { t, locale } = useGenerateLanguage();

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

  const { cachedPushToken } = useWebPush();
  const { mutate: NotificationMutation } = useTripNotification(cachedPushToken);

  const { mutate: tripGenerateMutation, isPending } = useGenerateTrip({
    onSuccess: (res) => {
      NotificationMutation({ planId: res.id, location });
      setLocation("");
    },
  });

  const handleGenerate = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!location.trim()) return alert(t.alertLocation);
    if (!mbti) return alert(t.alertMbti);
    if (!tripStyle) return alert(t.alertTripStyle);
    if (!tendency) return alert(t.alertTendency);
    if (!companion) return alert(t.alertCompanion);
    if (!transportation) return alert(t.alertTransport);

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

  return (
    <div
      className={`min-h-screen pb-10 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
      }`}
    >
      <form
        onSubmit={handleGenerate}
        className="max-w-4xl mx-auto px-4 pt-10 space-y-4"
      >
        <header
          className={`mb-6 border-b pb-4 ${
            isDarkMode ? "border-gray-800" : "border-transparent"
          }`}
        >
          <h1 className="text-2xl font-bold mb-1.5">{t.headerTitle}</h1>
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t.headerDesc}
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.locationLabel}
            </label>
          </div>
          <input
            type="text"
            className={`w-full h-11 border rounded-xl px-3 text-sm outline-none focus:border-blue-500 transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder={t.locationPlaceholder}
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.daysLabel}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={() => setDays(Math.max(0, days - 1))}
              className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              -
            </button>
            <span className="text-base font-semibold">
              {days === 0 ? t.dayTrip : t.formatDays(days)}
            </span>
            <button
              type="button"
              onClick={() => setDays(days + 1)}
              className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.mbtiLabel}
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
                  className={`cursor-pointer px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.preferenceTitle}
            </span>
          </div>

          <div>
            <p
              className={`text-xs font-semibold mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.tripStyleLabel}
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
                    className={`cursor-pointer text-sm px-3 py-2 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-blue-900/60 border-blue-500 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-600"
                        : isDarkMode
                          ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {TRIP_STYLE_TRANSLATIONS[tag][locale]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p
              className={`text-xs font-semibold mb-2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.tendencyLabel}
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
                    className={`cursor-pointer text-sm px-3 py-2 rounded-lg font-medium border transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-blue-900/60 border-blue-500 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-600"
                        : isDarkMode
                          ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {TENDENCY_TRANSLATIONS[tag][locale]}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`border-t my-4 ${
              isDarkMode ? "border-gray-700" : "border-gray-100"
            }`}
          />

          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles
              size={16}
              className={isDarkMode ? "text-blue-400" : "text-blue-600"}
            />
            <span
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.customRequestLabel}
            </span>
          </div>
          <textarea
            className={`w-full h-20 border rounded-xl p-3 text-sm outline-none focus:border-blue-500 resize-none transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder={t.customRequestPlaceholder}
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.companionLabel}
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
                  className={`cursor-pointer py-2.5 rounded-xl border text-sm font-medium text-center transition-all ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-900/60 border-blue-500 text-blue-400"
                        : "bg-blue-50 border-blue-600 text-blue-600"
                      : isDarkMode
                        ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {COMPANION_LABELS[locale][item]}
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
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.transportLabel}
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
                  className={`cursor-pointer py-2.5 rounded-xl border text-sm font-medium text-center transition-all ${
                    isSelected
                      ? isDarkMode
                        ? "bg-blue-900/60 border-blue-500 text-blue-400"
                        : "bg-blue-50 border-blue-600 text-blue-600"
                      : isDarkMode
                        ? "bg-gray-700 border-transparent text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {TRANSPORT_LABELS[locale][item]}
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
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t.paceLabel}
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
            <span>{t.paceRelaxed}</span>
            <span>{t.paceBusy}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`cursor-pointer w-full py-4 rounded-2xl font-semibold text-white text-base shadow-md flex items-center justify-center gap-2 transition-all ${
            isPending
              ? "bg-gray-400 cursor-not-allowed"
              : isDarkMode
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
          }`}
        >
          {isPending ? (
            <>
              <span>{t.submitting}</span>
              <Loader2 className="w-4 h-4 animate-spin" />
            </>
          ) : (
            <span>{t.submitButton}</span>
          )}
        </button>
      </form>
    </div>
  );
}
