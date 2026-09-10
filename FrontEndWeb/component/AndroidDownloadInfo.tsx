import Image from "next/image";

export const AndroidDownloadInfo = ({
  isDarkMode,
}: {
  isDarkMode: boolean;
}) => (
  <>
    <div className="w-52 h-52 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner border border-gray-100 mb-5 animate-fade-in relative">
      <Image
        src="/QR/android_app_install.png"
        alt="Android Build QR"
        width={208}
        height={208}
        className="w-full h-full object-contain"
      />
    </div>

    <div
      className={`w-full rounded-2xl p-4 text-[13px] font-medium space-y-2 border ${
        isDarkMode
          ? "bg-gray-900/50 border-gray-700"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          지원 환경:
        </span>
        <span className="text-emerald-500 font-bold">Android (APK)</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          테스트 계정:
        </span>
        <span className="font-bold text-blue-500">test@zelon.com</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          비밀번호:
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
        * 폰 카메라로 스캔 후 다운로드 페이지에서 설치해 주세요. (출처를 알 수
        없는 앱 경고 발생 시 &apos;무시하고 설치&apos; 선택)
      </p>
    </div>
  </>
);
