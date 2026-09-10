import Image from "next/image";

export const IosDownloadInfo = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div
    className={`w-full max-w-sm mx-auto rounded-2xl flex flex-col p-6 border animate-fade-in ${
      isDarkMode
        ? "bg-gray-900/30 border-gray-800 text-gray-300"
        : "bg-gray-50 border-gray-100 text-gray-600 shadow-sm"
    }`}
  >
    <div className="flex flex-col items-center text-center mb-5">
      <div
        className={`p-3 rounded-xl mb-3 bg-white shadow-sm border relative ${
          isDarkMode ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <Image
          src="/QR/ios_app_install.png"
          alt="ZelonTrip TestFlight QR"
          width={144}
          height={144}
          className="w-36 h-36 object-contain select-none"
        />
      </div>

      <p
        className={`text-[12px] leading-relaxed max-w-[260px] ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        아이폰 카메라로 QR 코드를 스캔하면
        <br />
        <span className="font-semibold text-blue-500 dark:text-blue-400">
          TestFlight
        </span>
        를 통해 앱을 설치할 수 있습니다.
      </p>
    </div>

    <div className="space-y-3.5 px-1">
      <div className="flex justify-between items-center">
        <span
          className={`text-[12.5px] font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          지원 환경:
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
          테스트 계정:
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
          비밀번호:
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
      className={`text-[11px] leading-relaxed px-1 ${
        isDarkMode ? "text-gray-500" : "text-gray-400"
      }`}
    >
      * 테스터 참여를 위해 기기에{" "}
      <span className="font-semibold text-blue-500 dark:text-blue-400">
        TestFlight
      </span>{" "}
      앱이 먼저 설치되어 있어야 합니다.
    </p>
  </div>
);
