import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Pressable,
} from "react-native";
import {
  Search,
  Sparkles,
  MapPin,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Star,
  RotateCw,
} from "lucide-react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { useAppTheme } from "../_layout";
import { LocationAskModal } from "@/components/modals/LocationAskModal";
import { saveNotificationToStorage } from "@/utils/saveNotificationToStorage";
import { useUserLocation } from "@/hooks/useUserLocation";
import { recommendTrip } from "@/api/trip/recommendTrip";
import { openGoogleMap } from "@/utils/openGoogleMap";
import { checkBadgeStatus } from "@/utils/checkBadgeStatus";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserTripStats } from "@/hooks/useUserTripStats";

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isDarkMode } = useAppTheme();

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

  ///////////////////////////////////////////////////////////////////////////

  const [modalVisible, setModalVisible] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const { displayLocation, coords, isLocationLoading, getUserLocation } =
    useUserLocation();

  useEffect(() => {
    getUserLocation();

    const notificationsListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        saveNotificationToStorage(notification, setHasNewNotification);
      },
    );

    checkBadgeStatus(setHasNewNotification);

    return () => notificationsListener.remove();
  }, []);

  //////////////////////////////////////////////////////////////////////////

  const { data: profileData, isPending: isProfilePending } = useUserProfile();

  const { data: statsData, isPending: isStatsPending } = useUserTripStats();

  const hasHistory = (statsData?.total_location ?? 0) > 0;

  ///////////////////////////////////////////////////////////////////////

  const {
    data: recommendedPlans,
    isPending: isRecommendPending,
    refetch: refetchRecommend,
    isRefetching: isRecommendRefetching,
  } = useQuery({
    queryKey: ["tripRecommend", hasHistory, coords],
    queryFn: () => recommendTrip({ hasHistory, coords }),
    enabled: (!isLocationLoading && !!coords) || hasHistory,
  });

  const handleRefreshRecommend = async () => {
    await queryClient.resetQueries({
      queryKey: ["tripRecommend", hasHistory, coords],
    });
    await refetchRecommend();
  };

  /////////////////////////////////////////////////////////////////////////

  const handleAskLocation = () => {
    const keyword = searchLocation.trim();
    if (!keyword) {
      alert("여행지를 입력해 주세요!");
      return;
    }
    setModalVisible(false);
    router.push({
      pathname: "/answer",
      params: { keyword },
    });
    setSearchLocation("");
  };

  const handleOpenGoogleMap = () => openGoogleMap(coords);

  /////////////////////////////////////////////////////////////////////

  return (
    <ScrollView
      style={[styles.container, theme.container]}
      showsVerticalScrollIndicator={false}
    >
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

      <View style={styles.welcomeSection}>
        {isProfilePending ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
            style={styles.loadingSpinner}
          />
        ) : (
          <Text style={[styles.userName, theme.textSub]}>
            {profileData?.nickname
              ? `${profileData.nickname}님,`
              : `${profileData?.username?.split("@")[0]}님,`}
          </Text>
        )}
        <Text style={[styles.welcomeTitle, theme.textMain]}>
          어디로 떠나고 {"\n"}싶으신가요?
        </Text>
      </View>

      <View style={{ flex: 1 }}>
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

        <LocationAskModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAsk={handleAskLocation}
          isDarkMode={isDarkMode}
          theme={theme}
          styles={styles}
        />
      </View>

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
            {profileData && (
              <Text style={[styles.loadingText, theme.textSub]}>
                {profileData.nickname
                  ? `${profileData.nickname}`
                  : `${profileData.username?.split("@")[0]}`}
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

///////////////////////////////////////////////////////////////////////

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
