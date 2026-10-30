"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAskLocationLanguage } from "@/hooks/languages/useAskLocationLanguage";

interface AskLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSubmit: (query: string) => void;
}

export const AskLocationModal = ({
  isOpen,
  onClose,
  onLocationSubmit,
}: AskLocationModalProps) => {
  const [location, setLocation] = useState("");
  const { isDarkMode } = useTheme();
  const { t } = useAskLocationLanguage();

  if (!isOpen) return null;

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLocationSubmit(location);
    setLocation("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-5 shadow-xl transition-all border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-100 text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">{t.modalTitle}</h2>
          <button
            onClick={onClose}
            type="button"
            className={`cursor-pointer p-1 rounded-full transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <p
          className={`text-sm mb-4 leading-relaxed ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {t.description}
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder={t.placeholder}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={`w-full h-12 border rounded-xl px-3 text-base mb-4 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
            autoFocus
          />
          <button
            type="submit"
            className="cursor-pointer w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-[0.99]"
          >
            {t.submitButton}
          </button>
        </form>
      </div>
    </div>
  );
};
