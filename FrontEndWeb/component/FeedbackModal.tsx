import React, { useState } from "react";
import { Loader2, X } from "lucide-react";

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

  if (!isOpen) return null;

  
  const handleClose = () => {
    setFeedbackText("");
    onClose();
  };


  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedFeedback = feedbackText.trim();

    if (!trimmedFeedback) {
      alert("피드백 내용을 입력해 주세요.");
      return;
    }
    if (trimmedFeedback.length < 5) {
      alert("피드백을 최소 5자 이상 입력해주세요.");
      return;
    }

    onFeedbackSubmit(trimmedFeedback);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-xl transform transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">💬 피드백 보내기</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-center leading-relaxed mb-4 text-gray-500 dark:text-gray-400">
          ZelonTrip을 이용하면서 좋았던 점이나 <br /> 불편했던 점을 자유롭게
          작성해주세요.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            maxLength={300}
            rows={4}
            autoFocus
            placeholder="여기에 내용을 입력해 주세요 (최대 300자)"
            className="w-full p-3.5 border rounded-lg text-sm resize-none outline-none transition-shadow focus:ring-2 focus:ring-blue-500/40 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 h-11 rounded-lg text-sm font-semibold transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "보내기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
