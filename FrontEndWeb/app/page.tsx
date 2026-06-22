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
  X,
  RotateCw,
} from "lucide-react";
import { client } from "@/api/client";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTheme } from "@/context/ThemeContext"; // 🎯 1. 전역 테마 훅 가져오기

export default function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDarkMode } = useTheme(); // 🎯 2. 다크모드 상태 구독

  const mapsLib = useMapsLibrary("maps");

  const [displayLocation, setDisplayLocation] = useState("위치 탐색 중...");
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // 1. 유저 데이터 동기화
  const { data: userData, isPending } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/auth/me");
      return response.data;
    },
  });

  // 2. 대시보드 통계 동기화
  const { data: statsData, isPending: isStatsPending } = useQuery({
    queryKey: ["userTripStats"],
    queryFn: async () => {
      const response = await client.get("/v1/user/stats");
      return response.data;
    },
  });

  const hasHistory = (statsData?.total_location ?? 0) > 0;

  // 3. 맞춤 추천 데이터 패칭
  const {
    data: recommendedPlans,
    isPending: isRecommendPending,
    refetch: refetchRecommend,
    isRefetching: isRecommendRefetching,
  } = useQuery({
    queryKey: ["tripRecommend"],
    queryFn: async () => {
      if (hasHistory) {
        const response = await client.get("/v1/trip/recommend/history");
        return response.data;
      } else {
        const response = await client.get("/v1/trip/recommend/nearby", {
          params: {
            latitude: coords?.latitude ?? 37.5665,
            longitude: coords?.longitude ?? 126.978,
          },
        });
        return response.data;
      }
    },
    enabled: !isLocationLoading && !isStatsPending && statsData !== undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 구글 라이브러리로 한글 주소 변환
  const fetchKoreanAddress = (lat: number, lng: number) => {
    if (!mapsLib || typeof google === "undefined" || !google.maps) {
      setDisplayLocation("위치 정보 가져오기 실패");
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng }, language: "ko" },
        (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            const fullAddress = results[0].formatted_address;
            const refinedAddress = fullAddress.replace("대한민국 ", "");
            setDisplayLocation(refinedAddress);
          } else {
            console.error("지오코딩 실패 상태 코드:", status);
            setDisplayLocation("서울, 대한민국");
          }
        },
      );
    } catch (e) {
      console.error("Geocoder 초기화 실패 시스템 예외:", e);
      setDisplayLocation("서울, 대한민국");
    }
  };

  // 브라우저 GPS 기반 좌표 탐색 처리
  const getUserLocation = () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      setDisplayLocation("서울, 대한민국");
      setCoords({ latitude: 37.5665, longitude: 126.978 });
      setIsLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        if (mapsLib) {
          fetchKoreanAddress(latitude, longitude);
        } else {
          setDisplayLocation("위치 정보 가져오는 중...");
        }
        setIsLocationLoading(false);
      },
      (error) => {
        console.error("위치 획득 실패:", error);
        setDisplayLocation("서울, 대한민국");
        setCoords({ latitude: 37.5665, longitude: 126.978 });
        setIsLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 7000 },
    );
  };

  const checkBadgeStatus = () => {
    const existingData = localStorage.getItem("zelontrip_notifications");
    if (existingData) {
      const list = JSON.parse(existingData);
      if (list.length > 0) setHasNewNotification(true);
    }
  };

  useEffect(() => {
    if (mapsLib && coords) {
      fetchKoreanAddress(coords.latitude, coords.longitude);
    }
  }, [mapsLib, coords]);

  useEffect(() => {
    getUserLocation();
    checkBadgeStatus();
  }, []);

  const handleAskAI = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      alert("여행지를 입력해 주세요!");
      return;
    }
    setModalVisible(false);
    router.push(`/answer?keyword=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  const handleOpenGoogleMap = () => {
    if (!coords?.latitude || !coords?.longitude) {
      alert("현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const { latitude, longitude } = coords;
    const googleMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(googleMapUrl, "_blank");
  };

  const handleRefreshRecommend = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });
    refetchRecommend();
  };

  return (
    <div
      className={`md:px-6 lg:px-12 xl:px-24 min-h-screen pb-16 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="mx-auto px-5">
        {/* 1. 상단 헤더 섹션 */}
        <header className="flex justify-between items-center pt-10 mb-6">
          <div>
            <span
              className={`text-xs block mb-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              현재 위치
            </span>
            <button
              onClick={getUserLocation}
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

        {/* 2. 메인 웰컴 카피 */}
        <section className="mb-6 min-h-[64px]">
          {isPending ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-1" />
          ) : (
            <p
              className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              {userData?.nickname
                ? `${userData.nickname}님,`
                : `${userData?.username?.split("@")[0] ?? "여행자"}님,`}
            </p>
          )}
          <h1 className="text-3xl font-extrabold leading-tight mt-1 whitespace-pre-line">
            어디로 떠나고 {"\n"}싶으신가요?
          </h1>
        </section>

        {/* 3. AI 스마트 검색 바 */}
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

        {/* 모달 윈도우 */}
        {modalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-5">
            <div
              className={`w-full max-w-sm rounded-2xl p-5 shadow-xl transition-colors ${
                isDarkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-white text-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">🤖 여행지 맞춤 정보</h2>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-400 hover:text-gray-500 outline-none"
                >
                  <X size={22} />
                </button>
              </div>
              <p
                className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                AI에게 궁금한 여행지를 물어보면 맞춤 여행 정보를 답변해줘요.
              </p>
              <form onSubmit={handleAskAI}>
                <input
                  type="text"
                  placeholder="예: 도쿄, 뉴욕, 파리, 런던 등"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-12 border rounded-xl px-3 text-base mb-4 outline-none focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
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
        )}

        {/* 4. AI 추천 섹션 */}
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
              {userData && (
                <p
                  className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  {userData.nickname || userData.username?.split("@")[0]}님을
                  위한 맞춤 여행지 분석중...
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x no-scrollbar">
              {recommendedPlans && recommendedPlans.length > 0 ? (
                recommendedPlans.map((item: any, index: number) => (
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
                ))
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

        {/* 5. 하단 배너 */}
        <button
          onClick={handleOpenGoogleMap}
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
