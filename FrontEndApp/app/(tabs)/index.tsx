import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import {
  Search,
  Sparkles,
  MapPin,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Star,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import * as Location from "expo-location";

export default function HomeScreen() {
  const [displayLocation, setDisplayLocation] = useState("위치 탐색 중...");
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { data: userData, isPending } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/auth/me");
      return response.data;
    },
  });

  const { data: statsData, isPending: isStatsPending } = useQuery({
    queryKey: ["userTripStats"],
    queryFn: async () => {
      const response = await client.get("/v1/user/stats");
      return response.data;
    },
  });

  const hasHistory = statsData && statsData.total_location > 0;

  const { data: recommendedPlans, isPending: isRecommendPending } = useQuery({
    queryKey: ["tripRecommend ", hasHistory, coords],
    queryFn: async () => {
      if (hasHistory) {
        const response = await client.get("/v1/trip/recommend/history");
        return response.data;
      } else {
        const response = await client.get("/v1/trips/recommend/nearby", {
          params: {
            latitude: coords?.latitude ?? 37.5665,
            longitude: coords?.longitude ?? 126.978,
          },
        });
        return response.data;
      }
    },
    enabled: !isLocationLoading || hasHistory,
  });

  const getUserLocation = async () => {
    setIsLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setDisplayLocation("서울, 대한민국");
        setCoords({ latitude: 37.5665, longitude: 126.978 });
        setIsLocationLoading(false);
        Alert.alert(
          "위치 권한 거부",
          "현재 위치 기준 서비스를 이용하시려면 설정에서 위치 권한을 허용해 주세요.",
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });

      let reverseRegion = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseRegion && reverseRegion.length > 0) {
        const address = reverseRegion[0];
        const cityName = address.city || address.region || "";
        const districtName = address.district || "";
        setDisplayLocation(`${cityName} ${districtName}`.trim() || "대한민국");
      } else {
        setDisplayLocation("위치 알 수 없음");
      }
    } catch (error) {
      setDisplayLocation("서울, 대한민국");
      setCoords({ latitude: 37.5665, longitude: 126.978 });
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 상단 헤더 섹션 */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.locationLabel}>현재 위치</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={getUserLocation}
            disabled={isLocationLoading}
          >
            <MapPin size={14} color="#2563EB" />
            {isLocationLoading ? (
              <ActivityIndicator
                size="small"
                color="#2563EB"
                style={{ marginLeft: 4 }}
              />
            ) : (
              <Text style={styles.locationText}>{displayLocation}</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#1F2937" strokeWidth={2} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* 2. 메인 웰컴 카피 */}
      <View style={styles.welcomeSection}>
        {isPending ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
            style={styles.loadingSpinner}
          />
        ) : (
          <Text style={styles.userName}>
            {userData?.nickname
              ? `${userData.nickname}님,`
              : `${userData?.username?.split("@")[0]}님,`}
          </Text>
        )}
        <Text style={styles.welcomeTitle}>어디로 떠나고 {"\n"}싶으신가요?</Text>
      </View>

      {/* 3. AI 스마트 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="AI에게 여행지를 말해보세요"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity>
            <SlidersHorizontal size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. AI 큐레이션 섹션 (조건부 맞춤 타이틀 적용) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Sparkles size={20} color="#2563EB" fill="#2563EB" />
            {/* 💡 유저 기록 유무에 따라 와닿는 타이틀 가공 */}
            <Text style={styles.sectionTitle}>맞춤 여행지 추천</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>전체보기</Text>
          </TouchableOpacity>
        </View>

        {isRecommendPending || isStatsPending ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>
              {userData?.nickname
                ? `${userData.nickname}님,`
                : `${userData?.username?.split("@")[0]}님,`}
              을 위한 여행지 분석 중...
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardList}
          >
            {recommendedPlans && recommendedPlans.length > 0 ? (
              recommendedPlans.map((item: any, index: number) => (
                <TouchableOpacity key={item.id || index} style={styles.card}>
                  <ImageBackground
                    source={{
                      uri:
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
                    }}
                    style={styles.cardImagePlaceholder}
                    // 이미지 자체의 테두리를 둥글게 깎아 카드 컴포넌트와 일체감을 줍니다.
                    // imageStyle={styles.cardImage}
                  >
                    <Text style={styles.cardTag}>
                      {item.tag || `#${item.category || "여행"}`}
                    </Text>
                  </ImageBackground>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.cardInfo}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <Text style={styles.rating}>{item.rating || "4.5"}</Text>

                      {/* 💡 백엔드에서 내려주는 distance ("취향 일치" 또는 "X.Xkm")를 그대로 바인딩합니다 */}
                      <Text style={styles.distance}>
                        {` • ${item.distance}`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  추천 가능한 여행지가 없습니다.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* 5. 실시간 가이드 바로가기 배너 */}
      <TouchableOpacity style={styles.banner}>
        <View>
          <Text style={styles.bannerSubtitle}>여행 중이신가요?</Text>
          <Text style={styles.bannerTitle}>여행 지도 켜기</Text>
        </View>
        <View style={styles.bannerIcon}>
          <ChevronRight size={24} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  locationLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 24, minHeight: 64 },
  userName: { fontSize: 18, color: "#4B5563", fontWeight: "500" },
  loadingSpinner: { alignSelf: "flex-start", marginVertical: 2 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 36,
    marginTop: 4,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 32 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  seeAll: { fontSize: 14, color: "#6B7280" },
  cardList: { paddingLeft: 20 },
  card: {
    width: 220,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: "#FFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImagePlaceholder: {
    height: 140,
    padding: 12,
    justifyContent: "flex-end",
  },
  cardTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },
  cardContent: { padding: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  cardInfo: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginLeft: 4 },
  distance: { fontSize: 14, color: "#9CA3AF", marginLeft: 4 },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 14 },
  emptyCard: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },
  emptyText: { color: "#9CA3AF", fontSize: 13 },
  banner: {
    marginHorizontal: 20,
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  bannerTitle: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
