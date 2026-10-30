"use client";

import React, { useState } from "react";
import { Loader2, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useFeedbackModalLanguage } from "@/hooks/languages/useFeedbackModalLanguage";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmit: (content: string) => void;
  isPending?: boolean;
}

export const FeedbackModal = ({
  isOpen,
  onClose,
  onFeedbackSubmit,
  isPending = false,
}: FeedbackModalProps) => {
  const [feedbackText, setFeedbackText] = useState("");
  const { isDarkMode } = useTheme();
  const { t } = useFeedbackModalLanguage();

  if (!isOpen) return null;

  const handleClose = () => {
    setFeedbackText("");
    onClose();
  };

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedFeedback = feedbackText.trim();

    if (!trimmedFeedback) {
      alert(t.emptyAlert);
      return;
    }
    if (trimmedFeedback.length < 5) {
      alert(t.minLenAlert);
      return;
    }

    onFeedbackSubmit(trimmedFeedback);
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{t.title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className={`cursor-pointer transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p
          className={`text-[13px] text-center leading-relaxed mb-4 whitespace-pre-line ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t.description}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            maxLength={300}
            rows={4}
            autoFocus
            placeholder={t.placeholder}
            className={`w-full p-3.5 border rounded-lg text-sm resize-none outline-none transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
              isDarkMode
                ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleClose}
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
              disabled={isPending}
              className="cursor-pointer flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
