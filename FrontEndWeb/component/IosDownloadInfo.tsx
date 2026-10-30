"use client";

import Image from "next/image";
import { useIosDownloadLanguage } from "@/hooks/languages/useIosDownloadLanguage";

export const IosDownloadInfo = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { t } = useIosDownloadLanguage();

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className={`p-4 rounded-xl mb-3 bg-white shadow-sm border relative ${
            isDarkMode ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <Image
            src="/QR/ios_app_install.png"
            alt={t.qrAlt}
            width={144}
            height={144}
            className="w-36 h-36 object-contain select-none"
          />
        </div>
      </div>
      <div
        className={`w-full max-w-sm mx-auto rounded-2xl flex flex-col p-4 border animate-fade-in ${
          isDarkMode
            ? "bg-gray-900/30 border-gray-800 text-gray-300"
            : "bg-gray-50 border-gray-100 text-gray-600 shadow-sm"
        }`}
      >
        <div className="space-y-2.5 px-1">
          <div className="flex justify-between items-center">
            <span
              className={`text-[12.5px] font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.supportedEnv}
            </span>
            <span className="text-[12.5px] font-bold text-green-600 dark:text-emerald-500">
              iOS (TestFlight)
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`text-[12.5px] font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.testAccount}
            </span>
            <span className="text-[12.5px] font-bold text-blue-600 dark:text-blue-400 font-mono">
              test@zelon.com
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span
              className={`text-[12.5px] font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.password}
            </span>
            <span className="text-[12.5px] font-bold text-blue-600 dark:text-blue-400 font-mono">
              zelon1234
            </span>
          </div>
        </div>

        <div
          className={`my-4 border-t border-dashed ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        />

        <p
          className={`text-[11.5px] leading-relaxed px-1 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {t.prerequisitePart1}
          <span className="font-semibold text-blue-500 dark:text-blue-400">
            {t.prerequisiteHighlight}
          </span>
          {t.prerequisitePart2}
        </p>
      </div>
    </div>
  );
};
