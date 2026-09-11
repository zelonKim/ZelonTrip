import React, { useState } from "react";
import { X } from "lucide-react";

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

  if (!isOpen) return null;

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLocationSubmit(location);
    setLocation("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 shadow-xl transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">🤖 여행지 맞춤 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 outline-none"
          >
            <X size={22} />
          </button>
        </div>

        <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
          AI에게 궁금한 여행지를 물어보면 맞춤 여행 정보를 답변해줘요.
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="예: 도쿄, 뉴욕, 파리, 런던 등"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-12 border rounded-xl px-3 text-base mb-4 outline-none focus:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            물어보기
          </button>
        </form>
      </div>
    </div>
  );
};
