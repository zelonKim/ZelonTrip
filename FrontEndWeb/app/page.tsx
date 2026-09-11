"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  MapPin,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Star,
  RotateCw,
} from "lucide-react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTheme } from "@/context/ThemeContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserTripStats } from "@/hooks/useUserTripStats";
import { Coordinates } from "@/types/Coordinates";
import { recommendTrip } from "@/api/trip/recommendTrip";
import { fetchKoreanAddress } from "@/utils/fetchKoreanAddress";
import { handleOpenGoogleMap } from "@/utils/handleOpenGoogleMap";
import { checkBadgeStatus } from "@/utils/checkBadgeStatus";
import { getUserLocation } from "@/utils/getUserLocation";
import { TripRecommendResponse } from "@/types/TripRecommend";
import { AskLocationModal } from "@/component/AskLocationModal";

export default function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme();

  const [displayLocation, setDisplayLocation] = useState("위치 탐색 중...");
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const mapsLib = useMapsLibrary("maps");

  ////////////////////////////////////////////////////////////////////

  useEffect(() => {
    getUserLocation(
      setIsLocationLoading,
      setDisplayLocation,
      setCoords,
      mapsLib,
    );
    checkBadgeStatus(setHasNewNotification);
  }, [mapsLib]);

  useEffect(() => {
    if (mapsLib && coords) {
      fetchKoreanAddress(
        coords.latitude,
        coords.longitude,
        mapsLib,
        setDisplayLocation,
      );
    }
  }, [mapsLib, coords]);

  ////////////////////////////////////////////////////////////////////

  const { data: profileData, isPending: isProfilePending } = useUserProfile();
  const { data: statsData, isPending: isStatsPending } = useUserTripStats();

  const hasHistory = (statsData?.total_location ?? 0) > 0;

  ////////////////////////////////////////////////////////////////////

  const {
    data: recommendedPlans,
    isPending: isRecommendPending,
    refetch: refetchRecommend,
    isRefetching: isRecommendRefetching,
  } = useQuery({
    queryKey: ["tripRecommend"],
    queryFn: () => recommendTrip({ hasHistory, coords }),
    enabled: !isLocationLoading && !isStatsPending && statsData !== undefined,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleRefreshRecommend = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });
    await refetchRecommend();
  };

  ////////////////////////////////////////////////////////////////////

  const handleAskLocation = (location: string) => {
    const keyword = location.trim();
    if (!keyword) {
      alert("여행지를 입력해 주세요!");
      return;
    }
    setModalVisible(false);
    router.push(`/answer?keyword=${encodeURIComponent(keyword)}`);
  };

  ////////////////////////////////////////////////////////////////////

  return (
    <div
      className={`max-w-6xl mx-auto min-h-screen pb-16 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto px-5">
        <header className="flex justify-between items-center pt-10 mb-6">
          <div>
            <span
              className={`text-xs block mb-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              현재 위치
            </span>
            <button
              onClick={() =>
                getUserLocation(
                  setIsLocationLoading,
                  setDisplayLocation,
                  setCoords,
                  mapsLib,
                )
              }
              disabled={isLocationLoading}
              className="flex items-center gap-1 cursor-pointer disabled:opacity-50 outline-none"
            >
              <MapPin
                size={14}
                className={isDarkMode ? "text-blue-400" : "text-blue-600"}
              />
              {isLocationLoading ? (
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block ml-1" />
              ) : (
                <span className="text-sm font-semibold">{displayLocation}</span>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              setHasNewNotification(false);
              router.push("/notification");
            }}
            className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            <Bell size={24} />
            {hasNewNotification && (
              <span
                className={`absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 ${
                  isDarkMode ? "border-gray-800" : "border-gray-200"
                }`}
              />
            )}
          </button>
        </header>

        <section className="mb-6 min-h-[64px]">
          {isProfilePending ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-1" />
          ) : (
            <p
              className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {profileData?.nickname
                ? `${profileData.nickname}님,`
                : `${profileData?.username?.split("@")[0] ?? "여행자"}님,`}
            </p>
          )}
          <h1 className="text-3xl font-extrabold leading-tight mt-1 whitespace-pre-line">
            어디로 떠나고 {"\n"}싶으신가요?
          </h1>
        </section>

        <section className="mb-8">
          <div
            onClick={() => setModalVisible(true)}
            className={`flex items-center justify-between px-4 h-14 rounded-2xl border cursor-pointer transition-colors ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Search size={20} className="text-gray-400" />
              <span className="text-gray-400 text-sm">
                궁금한 여행지를 물어보세요
              </span>
            </div>
            <SlidersHorizontal
              size={20}
              className={isDarkMode ? "text-gray-300" : "text-gray-600"}
            />
          </div>
        </section>

        <AskLocationModal
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
          onLocationSubmit={(location) => {
            handleAskLocation(location);
            setModalVisible(false);
          }}
        />

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles
                size={20}
                className={
                  isDarkMode
                    ? "text-blue-400 fill-blue-400/20"
                    : "text-blue-600 fill-blue-600"
                }
              />
              <h2 className="text-xl font-bold">맞춤 여행지 추천</h2>
            </div>
            <button
              onClick={handleRefreshRecommend}
              disabled={isRecommendPending || isRecommendRefetching}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <RotateCw
                size={16}
                className={`text-gray-500 ${isRecommendPending || isRecommendRefetching ? "animate-spin opacity-60" : ""}`}
              />
            </button>
          </div>

          {isRecommendPending || isStatsPending || isRecommendRefetching ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              {profileData && (
                <p
                  className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {profileData.nickname || profileData.username?.split("@")[0]}
                  님을 위한 맞춤 여행지 분석중...
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
              {recommendedPlans && recommendedPlans.length > 0 ? (
                recommendedPlans.map(
                  (item: TripRecommendResponse, index: number) => (
                    <div
                      key={item.id || index}
                      onClick={() =>
                        router.push(
                          `/answer?keyword=${encodeURIComponent(item.title.trim())}`,
                        )
                      }
                      className={`min-w-[230px] w-[230px] rounded-2xl overflow-hidden border cursor-pointer snap-start transition-all hover:scale-[1.02] ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div
                        className="h-[140px] p-3 flex items-end bg-cover bg-center relative"
                        style={{
                          backgroundImage: `url(${item.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span
                          className={`relative z-10 px-2.5 py-0.5 rounded-xl text-[11px] font-semibold ${
                            isDarkMode
                              ? "bg-gray-900/90 text-blue-400"
                              : "bg-gray-100/80 text-blue-600"
                          }`}
                        >
                          {item.tag || `#${item.category || "여행"}`}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3
                          className={`text-base font-bold truncate mb-1.5 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star
                            size={14}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="font-semibold">
                            {item.rating || "4.5"}
                          </span>
                          <span
                            className={
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {` • ${item.distance}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )
              ) : (
                <div
                  className={`w-full py-10 flex items-center justify-center border rounded-2xl transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-400"
                      : "bg-white border-gray-200 text-gray-500"
                  }`}
                >
                  추천 가능한 여행지가 없습니다.
                </div>
              )}
            </div>
          )}
        </section>

        <button
          onClick={() => handleOpenGoogleMap(coords)}
          className={`w-full text-white rounded-2xl p-6 flex justify-between items-center text-left transition-all shadow-lg ${"bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}`}
        >
          <div>
            <span className="text-sm text-white/80 block mb-1">
              혹시, 여행 중이신가요?
            </span>
            <h2 className="text-2xl font-bold">여행 지도 켜기</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronRight size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}
