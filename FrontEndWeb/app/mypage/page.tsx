"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Award,
  Footprints,
  Megaphone,
  MessageSquare,
  ChevronRight,
  Loader2,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { removeSecureItem } from "@/utils/secureLs";
import { useSendFeedback } from "@/hooks/useSendFeedback";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserTripStats } from "@/hooks/useUserTripStats";
import { useDeactivateUser } from "@/hooks/useDeactivateUser";
import { useUpdateNickname } from "@/hooks/useUpdateNickname";
import { NicknameModal } from "@/component/NicknameModal";
import { FeedbackModal } from "@/component/FeedbackModal";
import { useMyPageLanguage } from "@/hooks/languages/useMyPageLanguage";

export default function MyPagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputNickname, setInputNickname] = useState("");
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useMyPageLanguage(); 

  const handleToggleDarkMode = () => {
    const nextMode = !isDarkMode;
    toggleDarkMode();
    localStorage.setItem("zelontrip_theme", nextMode ? "dark" : "light");
  };

  const openNicknameModal = () => {
    setIsModalVisible(true);
    setInputNickname(profileData?.nickname || "");
  };

  const { mutate: saveNicknameMutation, isPending: isSaveNicknamePending } =
    useUpdateNickname({
      onSuccess: () => {
        setIsModalVisible(false);
        setInputNickname("");
      },
    });

  const handleSaveNickname = (newNickname: string) => {
    saveNicknameMutation(newNickname);
  };

  const { mutate: feedbackMutation, isPending: isFeedbackPending } =
    useSendFeedback({
      onSuccess: () => {
        setIsFeedbackModalVisible(false);
      },
    });

  const handleSendFeedback = (content: string) => {
    feedbackMutation(content);
  };

  const { mutate: deactivateMutation, isPending: isDeactivatePending } =
    useDeactivateUser();

  const handleDeactivate = () => {
    if (window.confirm(t.deactivateConfirm)) deactivateMutation();
  };

  const handleLogout = () => {
    if (window.confirm(t.logoutConfirm)) {
      try {
        removeSecureItem("userToken");
        queryClient.clear();
        router.replace("/login");
      } catch (error) {
        console.log(error);
        alert(t.logoutError);
      }
    }
  };

  const { data: profileData, isPending: isProfilePending } = useUserProfile();
  const { data: statsData, isPending: isStatsPending } = useUserTripStats();

  return (
    <div
      className={`min-w-screen min-h-screen w-full transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <header
          className={`pb-4 mb-6 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <h1 className="text-2xl font-bold tracking-tight">{t.headerTitle}</h1>
        </header>

        <main className="space-y-5">
          <section
            className={`p-4 rounded-2xl border shadow-sm transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  isDarkMode
                    ? "bg-blue-900/40 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <User className="w-7 h-7" />
              </div>

              <div className="flex-1 min-w-0">
                {isProfilePending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mt-1" />
                ) : (
                  <div className="flex flex-col">
                    {profileData?.nickname ? (
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg font-bold truncate">
                          {profileData.nickname}
                        </span>
                        <button
                          type="button"
                          onClick={openNicknameModal}
                          className={`cursor-pointer px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {t.editNickname}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={openNicknameModal}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm font-semibold self-start mb-1 transition-colors ${
                          isDarkMode
                            ? "text-blue-400 bg-blue-950/40 border-blue-900 hover:bg-blue-900/30"
                            : "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
                        }`}
                      >
                        {t.createNickname}
                      </button>
                    )}
                    <span
                      className={`text-sm font-medium truncate ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {profileData?.username}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <hr
              className={`my-4 ${
                isDarkMode ? "border-gray-700" : "border-gray-100"
              }`}
            />

            <div className="w-full">
              <div
                className={`flex items-center space-x-1.5 mb-3 text-sm font-semibold ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{t.badgeTitle}</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <div
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isDarkMode
                      ? "border-blue-900/50 bg-blue-950/30 text-blue-400"
                      : "border-blue-100 bg-blue-50 text-blue-600"
                  }`}
                >
                  {isStatsPending
                    ? t.analyzing
                    : (statsData?.total_location ?? 0) >= 5
                      ? t.badgePro
                      : (statsData?.total_location ?? 0) >= 2
                        ? t.badgeIntermediate
                        : t.badgeBeginner}
                </div>

                {(statsData?.total_days ?? 0) > 0 && (
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      isDarkMode
                        ? "border-blue-900/50 bg-blue-950/30 text-blue-400"
                        : "border-blue-100 bg-blue-50 text-blue-600"
                    }`}
                  >
                    {t.accumulatedDays(statsData?.total_days ?? 0)}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section
            className={`p-4 rounded-2xl border shadow-sm flex items-start space-x-3 transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex flex-col flex-1">
              <div
                className={`flex items-center space-x-1.5 mb-1 text-sm font-semibold ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span>{t.footprintsTitle}</span>
              </div>

              {isStatsPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 mt-2" />
              ) : (
                <p
                  className={`text-sm mt-1 leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {t.footprintsDesc(statsData?.total_location ?? 0)}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h2
              className={`text-sm font-semibold pl-0.5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {t.settingsTitle}
            </h2>

            <div
              className={`rounded-2xl border divide-y shadow-sm overflow-hidden transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 divide-gray-700"
                  : "bg-white border-gray-200 divide-gray-100"
              }`}
            >
              <div
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Moon
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-[15px] font-medium">{t.darkMode}</span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    isDarkMode ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push("/notice")}
                className={`cursor-pointer w-full flex items-center justify-between p-4 text-left transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700/60"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Megaphone
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-[15px] font-medium">{t.notice}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsFeedbackModalVisible(true)}
                className={`cursor-pointer w-full flex items-center justify-between p-4 text-left transition-colors ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700/60"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-[15px] font-medium">{t.feedback}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </section>

          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className={`cursor-pointer text-sm font-medium transition-colors ${
                isDarkMode
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.logout}
            </button>
            <span
              className={`${
                isDarkMode ? "text-gray-700" : "text-gray-200"
              } select-none`}
            >
              |
            </span>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isDeactivatePending}
              className={`cursor-pointer text-sm font-medium transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? "text-gray-500 hover:text-red-400"
                  : "text-gray-400 hover:text-red-500"
              }`}
            >
              {t.deactivate}
            </button>
          </div>

          <p
            className={`text-xs text-center font-medium pt-1 ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {t.version}
          </p>
        </main>
      </div>

      <NicknameModal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onNicknameSubmit={handleSaveNickname}
        isPending={isSaveNicknamePending}
        initialNickname={inputNickname}
      />

      <FeedbackModal
        isOpen={isFeedbackModalVisible}
        onClose={() => setIsFeedbackModalVisible(false)}
        onFeedbackSubmit={handleSendFeedback}
        isPending={isFeedbackPending}
      />
    </div>
  );
}
