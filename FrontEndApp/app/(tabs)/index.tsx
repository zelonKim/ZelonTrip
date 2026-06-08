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
  Linking,
  Modal,
  Pressable,
  Platform,
} from "react-native";
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
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../_layout";

export default function HomeScreen() {
  const { isDarkMode } = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [displayLocation, setDisplayLocation] = useState("위치 탐색 중...");
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [hasNewNotification, setHasNewNotification] = useState(false);

  // 💡 유기적 테마 컬러 매핑 오브젝트
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#4B5563" },
    iconColor: isDarkMode ? "#F9FAFB" : "#1F2937",
    iconButtonBg: { backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
    searchBarBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    modalContentBg: { backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" },
    modalInputBg: {
      backgroundColor: isDarkMode ? "#374151" : "#F9FAFB",
      borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
      color: isDarkMode ? "#F9FAFB" : "#1F2937",
    },
    refreshButtonBg: { backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
    badgeBorderColor: { borderColor: isDarkMode ? "#1F2937" : "#F3F4F6" },
  };

  const saveNotificationToStorage = async (
    notification: Notifications.Notification,
  ) => {
    try {
      const existingData = await AsyncStorage.getItem(
        "zelontrip_notifications",
      );
      const currentNotifications = existingData ? JSON.parse(existingData) : [];

      const newNotificationItem = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        date: new Date().toISOString(),
        planId: notification.request.content.data?.planId || null,
      };

      await AsyncStorage.setItem(
        "zelontrip_notifications",
        JSON.stringify([newNotificationItem, ...currentNotifications]),
      );
      setHasNewNotification(true);
    } catch (error) {
      console.log("알림 저장 실패:", error);
    }
  };

  useEffect(() => {
    getUserLocation();

    const notificationsListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        saveNotificationToStorage(notification);
      },
    );

    const checkBadgeStatus = async () => {
      const existingData = await AsyncStorage.getItem(
        "zelontrip_notifications",
      );
      if (existingData) {
        const list = JSON.parse(existingData);
        if (list.length > 0) setHasNewNotification(true);
      }
    };
    checkBadgeStatus();

    return () => notificationsListener.remove();
  }, []);

  const handleAskAI = () => {
    if (!searchQuery.trim()) {
      alert("여행지를 입력해 주세요!");
      return;
    }
    setModalVisible(false);
    router.push({
      pathname: "/answer",
      params: { keyword: searchQuery.trim() },
    });
    setSearchQuery("");
  };

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

  const {
    data: recommendedPlans,
    isPending: isRecommendPending,
    refetch: refetchRecommend,
    isRefetching: isRecommendRefetching,
  } = useQuery({
    queryKey: ["tripRecommend", hasHistory, coords],
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
    enabled: (!isLocationLoading && !!coords) || hasHistory,
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

  const handleOpenGoogleMap = async () => {
    if (!coords?.latitude || !coords?.longitude) {
      Alert.alert(
        "안내",
        "현재 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도해 주세요.",
      );
      return;
    }
    const { latitude, longitude } = coords;
    const googleMapUrl = `https://www.google.com/maps/@${latitude},${longitude},15z`;
    try {
      await Linking.openURL(googleMapUrl);
    } catch (error) {
      Alert.alert("에러", "구글 맵을 여는 중 문제가 발생했습니다.");
    }
  };

  const handleRefreshRecommend = async () => {
    await queryClient.resetQueries({
      queryKey: ["tripRecommend", hasHistory, coords],
    });
    await refetchRecommend();
  };

  return (
    <ScrollView
      style={[styles.container, theme.container]}
      showsVerticalScrollIndicator={false}
    >
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
              <Text style={[styles.locationText, theme.textMain]}>
                {displayLocation}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, theme.iconButtonBg]}
          onPress={() => {
            setHasNewNotification(false);
            router.push("/notification");
          }}
        >
          <Bell size={24} color={theme.iconColor} strokeWidth={2} />
          {hasNewNotification && (
            <View style={[styles.notificationBadge, theme.badgeBorderColor]} />
          )}
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
          <Text style={[styles.userName, theme.textSub]}>
            {userData?.nickname
              ? `${userData.nickname}님,`
              : `${userData?.username?.split("@")[0]}님,`}
          </Text>
        )}
        <Text style={[styles.welcomeTitle, theme.textMain]}>
          어디로 떠나고 {"\n"}싶으신가요?
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        {/* 3. AI 스마트 검색 바 */}
        <View style={styles.searchContainer}>
          <Pressable
            style={[styles.searchBar, theme.searchBarBg]}
            onPress={() => setModalVisible(true)}
          >
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={{ color: "#9CA3AF", fontSize: 14 }}>
                궁금한 여행지를 물어보세요
              </Text>
            </View>
            <SlidersHorizontal
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </Pressable>
        </View>

        {/* 팝업 모달 UI */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 50}
              style={styles.keyboardAvoidingWrapper}
            >
              <View
                style={[styles.modalContent, theme.modalContentBg]}
                onStartShouldSetResponder={() => true}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, theme.textMain]}>
                    🤖 여행지 맞춤 정보{" "}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X size={22} color={isDarkMode ? "#9CA3AF" : "#4B5563"} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.modalDescription, theme.textSub]}>
                  AI에게 궁금한 여행지를 물어보면 맞춤 여행 정보를 답변해줘요.
                </Text>
                <TextInput
                  style={[styles.modalInput, theme.modalInputBg]}
                  placeholder="예: 도쿄, 뉴욕, 파리, 런던 등"
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                  onSubmitEditing={handleAskAI}
                />
                <TouchableOpacity
                  style={styles.askButton}
                  onPress={handleAskAI}
                >
                  <Text style={styles.askButtonText}>물어보기</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </View>

      {/* 4. AI 큐레이션 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Sparkles size={20} color="#2563EB" fill="#2563EB" />
            <Text style={[styles.sectionTitle, theme.textMain]}>
              맞춤 여행지 추천
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, theme.refreshButtonBg]}
            onPress={handleRefreshRecommend}
            disabled={isRecommendPending || isRecommendRefetching}
          >
            <RotateCw
              size={16}
              color={
                isRecommendPending || isRecommendRefetching
                  ? "#9CA3AF"
                  : isDarkMode
                    ? "#9CA3AF"
                    : "#6B7280"
              }
              style={
                (isRecommendPending || isRecommendRefetching) &&
                styles.rotatingIcon
              }
            />
          </TouchableOpacity>
        </View>

        {isRecommendPending || isStatsPending || isRecommendRefetching ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#2563EB" />
            {userData && (
              <Text style={[styles.loadingText, theme.textSub]}>
                {userData.nickname
                  ? `${userData.nickname}`
                  : `${userData.username?.split("@")[0]}`}
                님을 위한 맞춤 여행지 분석중...
              </Text>
            )}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardList}
          >
            {recommendedPlans && recommendedPlans.length > 0 ? (
              recommendedPlans.map((item: any, index: number) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={[styles.card, theme.cardBg]}
                  onPress={() => {
                    router.push({
                      pathname: "/answer",
                      params: { keyword: item.title.trim() },
                    });
                  }}
                >
                  <ImageBackground
                    source={{
                      uri:
                        item.imageUrl ||
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
                    }}
                    style={styles.cardImagePlaceholder}
                  >
                    <Text style={styles.cardTag}>
                      {item.tag || `#${item.category || "여행"}`}
                    </Text>
                  </ImageBackground>
                  <View style={styles.cardContent}>
                    <Text
                      style={[styles.cardTitle, theme.textMain]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <View style={styles.cardInfo}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <Text style={[styles.rating, theme.textMain]}>
                        {item.rating || "4.5"}
                      </Text>
                      <Text
                        style={[styles.distance, theme.textSub]}
                      >{` • ${item.distance}`}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.emptyCard, theme.cardBg]}>
                <Text style={[styles.emptyText, theme.textSub]}>
                  추천 가능한 여행지가 없습니다.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* 5. 실시간 가이드 바로가기 배너 */}
      <TouchableOpacity style={styles.banner} onPress={handleOpenGoogleMap}>
        <View>
          <Text style={styles.bannerSubtitle}>혹시, 여행 중이신가요?</Text>
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
  container: { flex: 1 },
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
    marginLeft: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 24, minHeight: 64 },
  userName: { fontSize: 18, fontWeight: "500" },
  loadingSpinner: { alignSelf: "flex-start", marginVertical: 2 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    marginTop: 4,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 32 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 12 },
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
    marginLeft: 8,
  },
  cardList: { paddingLeft: 20 },
  card: {
    width: 220,
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardImagePlaceholder: {
    height: 140,
    padding: 12,
    justifyContent: "flex-end",
  },
  cardTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "600",
    color: "#2563EB",
  },
  cardContent: { padding: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardInfo: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", marginLeft: 4 },
  distance: { fontSize: 14, marginLeft: 4 },
  loadingWrapper: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 10, fontSize: 14 },
  emptyCard: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyText: { fontSize: 13 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalDescription: { fontSize: 14, marginBottom: 16 },
  modalInput: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  askButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  askButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  keyboardAvoidingWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "500",
  },
  rotatingIcon: {
    opacity: 0.6,
  },
});
