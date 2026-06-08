import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Compass,
  ChevronLeft,
  Share2,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Navigation,
} from "lucide-react-native";
import { client } from "@/api/client";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useAppTheme } from "../../_layout"; // 💡 루트 레이아웃 훅 가져오기

const fetchTripDetail = async (tripId: string) => {
  const res = await client.get(`/v1/trip/${tripId}`);
  return res.data;
};

const regenerateTripApi = async ({
  tripId,
  feedback,
}: {
  tripId: string;
  feedback: string;
}) => {
  const res = await client.post(`/v1/trip/${tripId}/regenerate`, {
    feedback,
  });
  return res.data;
};

const dayColors = ["#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444"];

const openGoogleMapsDirection = async (
  startLat: number | null,
  startLng: number | null,
  destLat: number,
  destLng: number,
) => {
  const origin = startLat && startLng ? `${startLat},${startLng}` : "";
  const destination = `${destLat},${destLng}`;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;

  try {
    const isSupported = await Linking.canOpenURL(googleMapsUrl);
    if (isSupported) {
      await Linking.openURL(googleMapsUrl);
    } else {
      Alert.alert("안내", "구글 맵 링크를 열 수 없습니다.");
    }
  } catch (error) {
    Alert.alert("안내", "지도 앱이나 브라우저를 열 수 없습니다.");
  }
};

export default function GeneratedPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useAppTheme(); // 💡 다크모드 상태 가져오기

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

  // 💡 유기적 테마 객체 구성
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    navBar: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },

    // 🍯 여행 꿀팁 섹션 (다크모드 시 눈 안아픈 무드등 느낌의 호박색 반영)
    tipsBg: {
      backgroundColor: isDarkMode ? "#252013" : "#FFFBEB",
      borderColor: isDarkMode ? "#45381D" : "#FEF3C7",
    },
    tipsText: { color: isDarkMode ? "#FCD34D" : "#78350F" },
    tipsDot: { color: isDarkMode ? "#F59E0B" : "#B45309" },

    curationBg: {
      backgroundColor: isDarkMode ? "#111827" : "#F8FAFC",
      borderColor: isDarkMode ? "#374151" : "#F1F5F9",
    },
    inputBg: { backgroundColor: isDarkMode ? "#111827" : "#F3F4F6" },
    iconColor: isDarkMode ? "#9CA3AF" : "#111827",
    indicatorColor: isDarkMode ? "#60A5FA" : "#2563EB",
  };

  const {
    data: planData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["tripDetail", id],
    queryFn: () => fetchTripDetail(id!),
    enabled: !!id,
  });

  const { mutate, isPending: isRegenerating } = useMutation({
    mutationFn: regenerateTripApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["tripList"] });

      setFeedback("");
      setShowFeedbackForm(false);

      Alert.alert("보완 완료 ✨", "AI가 일정을 보완하였습니다! ");
      router.push({
        pathname: "/(tabs)/plan/[id]",
        params: { id },
      });
    },
    onError: (error: any) => {
      Alert.alert(
        "에러",
        error?.response?.data?.detail || "일정 보완 중 오류가 발생했습니다.",
      );
    },
  });

  const getAllPlaces = () => {
    if (!planData?.itinerary) return [];
    return planData.itinerary.flatMap((dayItem: any) => dayItem.places || []);
  };

  const allPlaces = getAllPlaces();

  const getInitialRegion = () => {
    if (
      allPlaces.length > 0 &&
      allPlaces[0].latitude &&
      allPlaces[0].longitude
    ) {
      return {
        latitude: Number(allPlaces[0].latitude),
        longitude: Number(allPlaces[0].longitude),
        latitudeDelta: 0.0822,
        longitudeDelta: 0.0421,
      };
    }
    return {
      latitude: 37.5665,
      longitude: 126.978,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      Alert.alert("안내", "AI에게 요청할 수정 피드백을 입력해주세요!");
      return;
    }
    mutate({ tripId: id!, feedback });
  };

  const handleShare = async () => {
    if (!planData) return;

    try {
      const shareMessage = `✈️ [${planData.location}] 여행 일정을 공유합니다!\n\n📌 제목: ${planData.title}\n📝 개요: ${planData.overview}\n\n👇 자세한 일정은 앱에서 확인해보세요!`;

      const result = await Share.share({
        message: shareMessage,
        title: `${planData.location} 여행 일정`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("공유 완료 타입:", result.activityType);
        } else {
          Alert.alert("공유 성공", "정상적으로 공유가 완료되었습니다.");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("공유 취소");
      }
    } catch (error) {
      Alert.alert("안내", "공유하는 도중 오류가 발생했습니다.");
    }
  };

  const { mutate: deleteTrip, isPending: deletePending } = useMutation({
    mutationFn: async (tripId) => {
      const response = await client.delete(`/v1/trip/${tripId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      Alert.alert("삭제 완료", "여행 일정이 성공적으로 삭제되었습니다.");
      router.replace("/(tabs)/plans");
    },
    onError: (error) => {
      Alert.alert("삭제 실패", "삭제 중 오류가 발생했습니다.");
    },
  });

  if (isPending) {
    return (
      <View style={[styles.container, styles.center, theme.container]}>
        <ActivityIndicator size="large" color={theme.indicatorColor} />
        <Text style={[styles.loadingText, theme.textSub]}>
          상세 일정을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (isError || !planData) {
    return (
      <View style={[styles.container, styles.center, theme.container]}>
        <Text style={styles.errorText}>여행 일정을 불러올 수 없습니다. 😢</Text>
        <Text style={[styles.errorSubText, theme.textSub]}>
          {error?.message || "존재하지 않는 일정입니다."}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>이전 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, theme.container]}
    >
      {/* 상단 네비게이션 바 */}
      <View
        style={[styles.navBar, theme.navBar, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          onPress={() => router.replace("/plans")}
          style={styles.navIconBtn}
        >
          <ChevronLeft size={24} color={theme.iconColor} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, theme.textMain]}>
          {planData.location} 여행 일정 ✨
        </Text>
        <TouchableOpacity style={styles.navIconBtn} onPress={handleShare}>
          <Share2 size={20} color={theme.iconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🗺️ 1. 메인 헤더 카드 */}
        <View style={[styles.mainCard, theme.cardBg]}>
          <Text style={[styles.mainTitle, theme.textMain]}>
            {planData.title}
          </Text>
          <View
            style={[
              styles.dividerLight,
              { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
            ]}
          />
          <View style={styles.sectionHeader}>
            <Compass size={16} color="#2563EB" />
            <Text style={styles.metaTitle}>여행 개요</Text>
          </View>
          <Text style={[styles.overviewText, theme.textSub]}>
            {planData.overview}
          </Text>
        </View>

        {/* 💡 2. 맞춤형 꿀팁 섹션 */}
        {planData.custom_tips && planData.custom_tips.length > 0 && (
          <View style={[styles.tipsCard, theme.tipsBg]}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={18} color={isDarkMode ? "#FBBF24" : "#D97706"} />
              <Text
                style={[
                  styles.tipsTitle,
                  { color: isDarkMode ? "#FDE68A" : "#B45309" },
                ]}
              >
                여행 꿀팁 🍯
              </Text>
            </View>
            {planData.custom_tips.map((tip: string, idx: number) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={[styles.tipDot, theme.tipsDot]}>•</Text>
                <Text style={[styles.tipText, theme.tipsText]}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 🗺️ 동선 지도 (⚠️ 기존 코드 구조 100% 보존) */}
        {allPlaces.length > 0 && (
          <View style={[styles.mapCard, theme.cardBg]}>
            <View style={styles.mapHeader}>
              <MapPin size={16} color="#2563EB" />
              <Text style={[styles.mapSectionTitle, theme.textMain]}>
                한눈에 보는 동선 🗺️
              </Text>
            </View>
            <MapView
              style={styles.map}
              initialRegion={getInitialRegion()}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              userInterfaceStyle={isDarkMode ? "dark" : "light"} // 지도에만 다크 속성 추가
            >
              {planData.itinerary &&
                planData.itinerary.map((dayItem: any, dayIdx: number) => {
                  const currentColor = dayColors[dayIdx % dayColors.length];

                  return (
                    <React.Fragment key={`day-group-${dayIdx}`}>
                      {dayItem.places &&
                        dayItem.places.map((place: any, pIdx: number) => {
                          const lat = Number(place.latitude);
                          const lng = Number(place.longitude);

                          if (isNaN(lat) || isNaN(lng)) return null;

                          return (
                            <Marker
                              key={`marker-${dayIdx}-${pIdx}`}
                              coordinate={{ latitude: lat, longitude: lng }}
                              title={place.place_name}
                              description={place.address}
                              anchor={{ x: 0.5, y: 0.5 }}
                            >
                              <View
                                style={[
                                  styles.customMarker,
                                  { backgroundColor: currentColor },
                                ]}
                              >
                                <Text style={styles.customMarkerText}>
                                  {dayItem.day}-{pIdx + 1}
                                </Text>
                              </View>
                            </Marker>
                          );
                        })}

                      {dayItem.places && (
                        <Polyline
                          coordinates={dayItem.places
                            .map((p: any) => ({
                              latitude: Number(p.latitude),
                              longitude: Number(p.longitude),
                            }))
                            .filter(
                              (c: any) =>
                                !isNaN(c.latitude) && !isNaN(c.longitude),
                            )}
                          strokeColor={currentColor}
                          strokeWidth={4}
                          lineDashPattern={[5, 5]}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
            </MapView>
          </View>
        )}

        {/* 📅 3. 상세 일차별 동선 리스트 */}
        <Text style={[styles.listSectionTitle, theme.textMain]}>
          동선 가이드
        </Text>

        {planData.itinerary &&
          planData.itinerary.map((dayItem: any, dayIdx: number) => {
            const currentColor = dayColors[dayIdx % dayColors.length];

            return (
              <View key={dayIdx} style={[styles.scheduleCard, theme.cardBg]}>
                <View
                  style={[
                    styles.dayBadge,
                    {
                      backgroundColor: `${currentColor}15`,
                    },
                  ]}
                >
                  <Text style={[styles.dayBadgeText, { color: currentColor }]}>
                    DAY {dayItem.day}
                  </Text>
                </View>

                {dayItem.places &&
                  dayItem.places.map((place: any, pIdx: number) => (
                    <View key={pIdx}>
                      {/* 💡 동선 경로 버튼 추가 */}
                      {pIdx > 0 && (
                        <View style={styles.routeLinkContainer}>
                          <View
                            style={[
                              styles.routeLine,
                              {
                                backgroundColor: `${currentColor}50`,
                              },
                            ]}
                          />
                          <TouchableOpacity
                            style={[
                              styles.routeBtn,
                              {
                                borderColor: currentColor,
                                backgroundColor: currentColor,
                              },
                            ]}
                            onPress={() => {
                              const startLat = Number(
                                dayItem.places[pIdx - 1].latitude,
                              );
                              const startLng = Number(
                                dayItem.places[pIdx - 1].longitude,
                              );
                              const destLat = Number(place.latitude);
                              const destLng = Number(place.longitude);

                              if (
                                isNaN(startLat) ||
                                isNaN(startLng) ||
                                isNaN(destLat) ||
                                isNaN(destLng)
                              ) {
                                Alert.alert(
                                  "안내",
                                  "좌표 정보가 정확하지 않아 길찾기를 열 수 없습니다.",
                                );
                                return;
                              }
                              openGoogleMapsDirection(
                                startLat,
                                startLng,
                                destLat,
                                destLng,
                              );
                            }}
                          >
                            <Navigation
                              size={12}
                              color={"white"}
                              style={{
                                marginRight: 4,
                              }}
                            />
                            <Text
                              style={[styles.routeBtnText, { color: "white" }]}
                            >
                              구글 맵 길찾기
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <View style={styles.placeRow}>
                        <View style={styles.timelineDotLine}>
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: currentColor },
                            ]}
                          />
                          {pIdx !== dayItem.places.length - 1 && (
                            <View
                              style={[
                                styles.line,
                                {
                                  backgroundColor: isDarkMode
                                    ? "#374151"
                                    : "#E0E7FF",
                                },
                              ]}
                            />
                          )}
                        </View>

                        <View style={styles.placeInfo}>
                          <View style={styles.placeTitleRow}>
                            <Text style={[styles.placeName, theme.textMain]}>
                              <Text
                                style={{
                                  color: currentColor,
                                  fontWeight: "800",
                                }}
                              >
                                {dayItem.day}-{pIdx + 1}.{" "}
                              </Text>
                              {place.place_name}
                            </Text>
                          </View>

                          <Text
                            style={[styles.placeDescription, theme.textSub]}
                          >
                            {place.description}
                          </Text>

                          {place.proposed_reason && (
                            <View
                              style={[styles.curationBox, theme.curationBg]}
                            >
                              <View style={styles.curationHeader}>
                                <Sparkles size={12} color={currentColor} />
                                <Text
                                  style={[styles.curationTitle, theme.textMain]}
                                >
                                  AI 추천 이유
                                </Text>
                              </View>
                              <Text
                                style={[styles.curationText, theme.textSub]}
                              >
                                {place.proposed_reason}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            );
          })}

        {/* 🛠️ 4. 하단 액션 영역 */}
        <View style={styles.actionGroup}>
          {!showFeedbackForm && (
            <>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => setShowFeedbackForm(true)}
              >
                <Text style={styles.confirmBtnText}>일정 보완하기 🤖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.listBtn,
                  {
                    backgroundColor: theme.cardBg.backgroundColor,
                    borderColor: theme.cardBg.borderColor,
                  },
                ]}
                onPress={() => {
                  Alert.alert(
                    "여행 삭제",
                    "정말로 여행 일정을 삭제하시겠습니까?",
                    [
                      {
                        text: "취소",
                        onPress: () => console.log("삭제 취소됨"),
                        style: "cancel",
                      },
                      {
                        text: "삭제",
                        onPress: () => deleteTrip(planData.id),
                        style: "destructive",
                      },
                    ],
                  );
                }}
              >
                <Text style={[styles.listBtnText, theme.textSub]}>
                  일정 삭제하기
                </Text>
              </TouchableOpacity>
            </>
          )}
          {showFeedbackForm && (
            <View style={[styles.feedbackContainer, theme.cardBg]}>
              <View style={styles.feedbackHeader}>
                <MessageSquare size={16} color="#2563EB" />
                <Text style={[styles.feedbackTitle, theme.textMain]}>
                  보완하고 싶은 내용을 적어주세요.
                </Text>
              </View>

              <TextInput
                style={[styles.feedbackInput, theme.inputBg, theme.textMain]}
                multiline
                numberOfLines={4}
                placeholder="예) 둘째 날 저녁에 예쁜 야경 코스 하나 추가해줘! 혹은 전체 기간 하루 늘려줘."
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                value={feedback}
                onChangeText={setFeedback}
                editable={!isRegenerating}
                textAlignVertical="top"
              />

              <View style={styles.formButtonRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
                  ]}
                  onPress={() => {
                    setShowFeedbackForm(false);
                    setFeedback("");
                  }}
                  disabled={isRegenerating}
                >
                  <Text style={[styles.cancelBtnText, theme.textSub]}>
                    취소
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!feedback.trim() || isRegenerating) && styles.disabledBtn,
                  ]}
                  onPress={handleFeedbackSubmit}
                  disabled={!feedback.trim() || isRegenerating}
                >
                  {isRegenerating ? (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 3,
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.submitBtnText}>보완 요청 중 </Text>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>보완 요청 ✨</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 16,
    fontWeight: "500",
  },
  errorSubText: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  backBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 16, fontWeight: "700" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },

  mainCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 30,
  },
  dividerLight: { height: 1, marginVertical: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 6,
  },
  overviewText: { fontSize: 14, lineHeight: 22 },

  mapCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  mapSectionTitle: { fontSize: 15, fontWeight: "700" },
  map: { width: "100%", height: 220, borderRadius: 12 },

  tipsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  tipRow: { flexDirection: "row", marginBottom: 6, alignItems: "flex-start" },
  tipDot: { marginRight: 6, fontSize: 14, lineHeight: 18 },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  listSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
    paddingLeft: 2,
  },
  scheduleCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    includeFontPadding: false,
  },

  placeRow: { flexDirection: "row", minHeight: 90 },
  timelineDotLine: { alignItems: "center", marginRight: 14, width: 12 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  line: { flex: 1, width: 2, marginVertical: 4 },

  placeInfo: { flex: 1, paddingBottom: 20 },
  placeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 8,
  },
  placeName: { fontSize: 16, fontWeight: "700" },
  placeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  curationBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  curationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  curationTitle: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  curationText: { fontSize: 12, lineHeight: 18 },

  routeLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    marginTop: -4,
    marginBottom: 4,
    height: 40,
  },
  routeLine: {
    width: 3,
    height: "100%",
    marginLeft: 1,
    marginTop: 5,
  },
  routeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
    marginLeft: 22,
    marginTop: 3,
  },
  routeBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },

  actionGroup: { marginTop: 10, gap: 12 },
  listBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  listBtnText: { fontSize: 16, fontWeight: "600" },
  confirmBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  confirmBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  feedbackContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  feedbackTitle: { fontSize: 14, fontWeight: "700" },
  feedbackInput: {
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
  },
  formButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: { fontWeight: "600", fontSize: 14 },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    justifyContent: "center",
  },
  submitBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  disabledBtn: { backgroundColor: "#9CA3AF" },
  customMarker: {
    // 💡 완벽한 원형(Circle)을 만들기 위해 가로/세로 크기를 고정하고 동일하게 맞춤
    width: 32,
    height: 32,
    borderRadius: 16, // width, height의 정확히 절반으로 주어 찌그러짐 없는 원형 보장
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2, // 테두리를 살짝 더 두껍게 주어 지도 레이어 위에서 명확하게 분리
    borderColor: "#FFFFFF",

    // 💡 그림자를 조금 더 은은하고 부드럽게 퍼지도록 조정 (자연스러운 입체감)
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  customMarkerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900", // 글씨체를 조금 더 두껍게 하여 원형 안에서 숫자가 한눈에 들어오도록 개선
    textAlign: "center",
    textAlignVertical: "center", // 안드로이드 텍스트 수직 중앙 정렬 안정화
    includeFontPadding: false, // 텍스트 상하단 불필요한 패딩 제거로 완벽한 중앙 배치
  },
});
