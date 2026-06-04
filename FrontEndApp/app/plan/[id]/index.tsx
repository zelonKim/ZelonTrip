import React, { useState, useEffect } from "react";
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
  Linking, // 💡 외부 링크 연동을 위해 임포트 추가
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
  Map, // 💡 길찾기 어울리는 아이콘 추가
} from "lucide-react-native";
import { client } from "@/api/client";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

// 💡 1. 구글 맵 앱 또는 웹 브라우저 경로 연동을 위한 범용 유틸 함수 추가
const openGoogleMapsDirection = async (
  startLat: number | null,
  startLng: number | null,
  destLat: number,
  destLng: number,
) => {
  const origin = startLat && startLng ? `${startLat},${startLng}` : "";
  const destination = `${destLat},${destLng}`;

  // 글로벌 세계 여행에 가장 최적화된 대중교통(transit) 모드 기반 범용 링크
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;

  try {
    const isSupported = await Linking.canOpenURL(googleMapsUrl);
    if (isSupported) {
      await Linking.openURL(googleMapsUrl);
    } else {
      Alert.alert("안내", "구글 맵 링크를 열 수 없습니다.");
    }
  } catch (error) {
    console.error("구글 맵 연동 실패:", error);
    Alert.alert("안내", "지도 앱이나 브라우저를 열 수 없습니다.");
  }
};

export default function GeneratedPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");

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

      Alert.alert(
        "보완 완료 ✨",
        "AI가 피드백을 반영하여 일정을 보완하였습니다! ",
      );
      router.push({
        pathname: "/plan/[id]",
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

  if (isPending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>상세 일정을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !planData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>旅行 일정을 불러올 수 없습니다. 😢</Text>
        <Text style={styles.errorSubText}>
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
      style={styles.container}
    >
      {/* 상단 네비게이션 바 */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.replace("/plans")}
          style={styles.navIconBtn}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{planData.location} 여행 일정 ✨</Text>
        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={() => console.log("공유하기")}
        >
          <Share2 size={20} color="#111827" />
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
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>{planData.title}</Text>
          <View style={styles.dividerLight} />
          <View style={styles.sectionHeader}>
            <Compass size={16} color="#2563EB" />
            <Text style={styles.metaTitle}>여행 개요</Text>
          </View>
          <Text style={styles.overviewText}>{planData.overview}</Text>
        </View>

        {/* 💡 2. 맞춤형 꿀팁 섹션 */}
        {planData.custom_tips && planData.custom_tips.length > 0 && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={18} color="#D97706" />
              <Text style={styles.tipsTitle}>여행 꿀팁 🍯</Text>
            </View>
            {planData.custom_tips.map((tip: string, idx: number) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 🗺️ 동선 지도 */}
        {allPlaces.length > 0 && (
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <MapPin size={16} color="#2563EB" />
              <Text style={styles.mapSectionTitle}>한눈에 보는 동선 🗺️</Text>
            </View>
            <MapView
              style={styles.map}
              initialRegion={getInitialRegion()}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
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
                          strokeWidth={3}
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
        <Text style={styles.listSectionTitle}>동선 가이드</Text>

        {planData.itinerary &&
          planData.itinerary.map((dayItem: any, dayIdx: number) => {
            const currentColor = dayColors[dayIdx % dayColors.length];

            return (
              <View key={dayIdx} style={styles.scheduleCard}>
                <View
                  style={[
                    styles.dayBadge,
                    { backgroundColor: `${currentColor}15` },
                  ]}
                >
                  <Text style={[styles.dayBadgeText, { color: currentColor }]}>
                    DAY {dayItem.day}
                  </Text>
                </View>

                {dayItem.places &&
                  dayItem.places.map((place: any, pIdx: number) => (
                    <View key={pIdx}>
                      {/* 💡 2. 동선 경로 버튼 추가 (2번째 방문지부터 이전 방문지를 출발지로 지정하여 노출) */}
                      {pIdx > 0 && (
                        <View style={styles.routeLinkContainer}>
                          <View
                            style={[
                              styles.routeLine,
                              { backgroundColor: `${currentColor}40` },
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
                            <View style={styles.line} />
                          )}
                        </View>

                        <View style={styles.placeInfo}>
                          <View style={styles.placeTitleRow}>
                            <Text style={styles.placeName}>
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

                          <Text style={styles.placeDescription}>
                            {place.description}
                          </Text>

                          {place.proposed_reason && (
                            <View style={styles.curationBox}>
                              <View style={styles.curationHeader}>
                                <Sparkles size={12} color={currentColor} />
                                <Text
                                  style={[
                                    styles.curationTitle,
                                    { color: "black" },
                                  ]}
                                >
                                  AI 추천 이유
                                </Text>
                              </View>
                              <Text style={styles.curationText}>
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
                style={styles.listBtn}
                onPress={() => router.replace("/plans")}
              >
                <Text style={styles.listBtnText}>목록으로</Text>
              </TouchableOpacity>
            </>
          )}

          {showFeedbackForm && (
            <View style={styles.feedbackContainer}>
              <View style={styles.feedbackHeader}>
                <MessageSquare size={16} color="#2563EB" />
                <Text style={styles.feedbackTitle}>
                  보완하고 싶은 내용을 적어주세요.
                </Text>
              </View>

              <TextInput
                style={styles.feedbackInput}
                multiline
                numberOfLines={4}
                placeholder="예) 둘째 날 저녁에 예쁜 야경 코스 하나 추가해줘! 혹은 전체 기간 하루 늘려줘."
                placeholderTextColor="#9CA3AF"
                value={feedback}
                onChangeText={setFeedback}
                editable={!isRegenerating}
                textAlignVertical="top"
              />

              <View style={styles.formButtonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowFeedbackForm(false);
                    setFeedback("");
                  }}
                  disabled={isRegenerating}
                >
                  <Text style={styles.cancelBtnText}>취소</Text>
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
                    <View style={{ flexDirection: "row", gap: 3 }}>
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
    fontWeight: "500",
  },
  errorSubText: {
    fontSize: 13,
    color: "#9CA3AF",
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  navIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    lineHeight: 30,
  },
  dividerLight: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 14 },
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
  overviewText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  mapSectionTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  map: { width: "100%", height: 220, borderRadius: 12 },

  tipsCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEF3C7",
    marginBottom: 24,
  },
  tipsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B45309",
    marginLeft: 6,
  },
  tipRow: { flexDirection: "row", marginBottom: 6, alignItems: "flex-start" },
  tipDot: { color: "#B45309", marginRight: 6, fontSize: 14, lineHeight: 18 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
    fontWeight: "500",
  },

  listSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
    paddingLeft: 2,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  dayBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    includeFontPadding: false,
  },

  placeRow: { flexDirection: "row", minHeight: 90 },
  timelineDotLine: { alignItems: "center", marginRight: 14, width: 12 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginTop: 6,
  },
  line: { flex: 1, width: 2, backgroundColor: "#E0E7FF", marginVertical: 4 },

  placeInfo: { flex: 1, paddingBottom: 20 },
  placeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 8,
  },
  placeName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  placeDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },

  curationBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  curationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  curationTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
    marginLeft: 4,
  },
  curationText: { fontSize: 12, color: "#64748B", lineHeight: 18 },

  routeLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    marginTop: 5,
    marginBottom: 12,
    height: 32,
  },
  routeLine: {
    width: 3,
    height: "100%",
    marginLeft: 1,
  },
  routeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 20,
  },
  routeBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },

  actionGroup: { marginTop: 10, gap: 12 },
  listBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listBtnText: { color: "#4B5563", fontSize: 16, fontWeight: "600" },
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  feedbackTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  feedbackInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
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
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: { color: "#4B5563", fontWeight: "600", fontSize: 14 },
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: { elevation: 3 },
    }),
  },
  customMarkerText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
});
