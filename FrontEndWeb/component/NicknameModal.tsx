import React, { useState } from "react";
import { NicknameModalProps } from "@/types/NicknameModalProps";
import { Loader2 } from "lucide-react";

export const NicknameModal = ({
  isOpen,
  onClose,
  onNicknameSubmit,
  isPending = false,
  initialNickname = "",
}: NicknameModalProps) => {
  const [nickname, setNickname] = useState(initialNickname);

  if (!isOpen) return null;

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      alert("닉네임을 입력해 주세요.");
      return;
    }
    onNicknameSubmit(trimmedNickname);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-xl transform transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <h3 className="text-lg font-bold mb-1.5">닉네임 설정</h3>
        <p className="text-xs mb-4 text-gray-500 dark:text-gray-400">
          새로운 닉네임을 입력해 주세요.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={15}
            autoFocus
            placeholder="닉네임 입력"
            className="w-full h-11 px-3.5 border rounded-lg text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-blue-500/40 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
          />

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11 rounded-lg text-sm font-semibold transition-colors bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || !nickname.trim()}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "저장"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
