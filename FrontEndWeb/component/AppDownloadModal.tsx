"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { AppDownloadModalProps } from "@/types/AppDownloadModalProps";
import { AndroidDownloadInfo } from "./AndroidDownloadInfo";
import { IosDownloadInfo } from "./IosDownloadInfo";

type TabType = "android" | "ios";

export const AppDownloadModal = ({
  isOpen,
  isDarkMode,
  onClose,
}: AppDownloadModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("android");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center border transition-all transform scale-100 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full border transition-all ${
            isDarkMode
              ? "border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              : "border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mt-2 mb-4">
          <h3 className="text-xl font-black tracking-tight mb-1">
            ZelonTrip 모바일 앱 🏝️
          </h3>
          <p
            className={`text-xs font-medium ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            원하시는 모바일 운영체제를 선택해 주세요
          </p>
        </div>

        <div
          className={`w-full flex p-1 rounded-xl mb-5 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "android"
                ? isDarkMode
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-900 shadow-xs"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            Android
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "ios"
                ? isDarkMode
                  ? "bg-gray-800 text-white shadow-md"
                  : "bg-white text-gray-900 shadow-xs"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            iOS (iPhone)
          </button>
        </div>

        {activeTab === "android" ? (
          <AndroidDownloadInfo isDarkMode={isDarkMode} />
        ) : (
          <IosDownloadInfo isDarkMode={isDarkMode} />
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm mt-5 transition-all active:scale-[0.99]"
        >
          확인
        </button>
      </div>
    </div>
  );
};
