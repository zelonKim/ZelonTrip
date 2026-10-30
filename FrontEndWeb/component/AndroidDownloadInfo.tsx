"use client";

import Image from "next/image";
import { useAndroidDownloadLanguage } from "@/hooks/languages/useAndroidDownloadLanguage";

export const AndroidDownloadInfo = ({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) => {
  const { t } = useAndroidDownloadLanguage();

  return (
    <>
      <div className="w-52 h-52 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner border border-gray-100 mb-5 animate-fade-in relative">
        <Image
          src="/QR/android_app_install.png"
          alt={t.qrAlt}
          width={208}
          height={208}
          className="w-full h-full object-contain"
        />
      </div>

      <div
        className={`w-full rounded-2xl p-4 text-[13px] font-medium space-y-2.5 border ${
          isDarkMode
            ? "bg-gray-900/50 border-gray-700"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {t.supportedEnv}
          </span>
          <span className="text-emerald-500 font-bold">Android (APK)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {t.testAccount}
          </span>
          <span className="font-bold text-blue-500">test@zelon.com</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {t.password}
          </span>
          <span className="font-bold text-blue-500">zelon1234</span>
        </div>
        <p
          className={`text-xs leading-relaxed pt-1.5 border-t border-dashed ${
            isDarkMode
              ? "border-gray-700 text-gray-500"
              : "border-gray-300 text-gray-400"
          }`}
        >
          {t.guideNotice}
        </p>
      </div>
    </>
  );
};
