"use client";

import React, { useState } from "react";
import { NicknameModalProps } from "@/types/NicknameModalProps";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useNicknameModalLanguage } from "@/hooks/languages/useNicknameModalLanguage";

export const NicknameModal = ({
  isOpen,
  onClose,
  onNicknameSubmit,
  isPending = false,
  initialNickname = "",
}: NicknameModalProps) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [prevInitial, setPrevInitial] = useState(initialNickname);

  const { isDarkMode } = useTheme();
  const { t } = useNicknameModalLanguage();

  if (initialNickname !== prevInitial) {
    setPrevInitial(initialNickname);
    setNickname(initialNickname);
  }

  if (!isOpen) return null;

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      alert(t.alertEmpty);
      return;
    }
    onNicknameSubmit(trimmedNickname);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-sm p-6 rounded-2xl shadow-xl transform transition-all border ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-gray-100 text-gray-900"
        }`}
      >
        <h3 className="text-lg font-bold mb-1.5">{t.title}</h3>
        <p
          className={`text-xs mb-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t.description}
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={15}
            autoFocus
            placeholder={t.placeholder}
            className={`w-full h-11 px-3.5 border rounded-lg text-[15px] outline-none transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={`cursor-pointer flex-1 h-11 rounded-lg text-sm font-semibold transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending || !nickname.trim()}
              className="cursor-pointer flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
