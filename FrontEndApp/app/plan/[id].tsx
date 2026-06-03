import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Compass,
  ChevronLeft,
  Share2,
  Lightbulb,
  Sparkles,
} from "lucide-react-native";
import { client } from "@/api/client";

const fetchTripDetail = async (tripId: string) => {
  const response = await client.get(`/v1/trip/${tripId}`);
  return response.data;
};

export default function GeneratedPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: planData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["tripDetail", id],
    queryFn: () => fetchTripDetail(id),
  });

  // 💡 4. 로딩 중 UI 처리
  if (isPending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>상세 일정을 불러오는 중...</Text>
      </View>
    );
  }

  // 💡 5. API 에러 및 데이터 부재 가드 처리
  if (isError || !planData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>여행 일정을 불러올 수 없습니다. 😢</Text>
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
    <View style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={[styles.navBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
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
      >
        {/* 🗺️ 1. 메인 헤더 카드 (Title & Overview) */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>{planData.title}</Text>
          <View style={styles.dividerLight} />
          <View style={styles.sectionHeader}>
            <Compass size={16} color="#2563EB" />
            <Text style={styles.metaTitle}>여행 개요</Text>
          </View>
          <Text style={styles.overviewText}>{planData.overview}</Text>
        </View>

        {/* 💡 2. 맞춤형 꿀팁 섹션 (custom_tips 맵핑) */}
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

        {/* 📅 3. 상세 일차별 동선 리스트 (itinerary -> places 맵핑) */}
        <Text style={styles.listSectionTitle}>동선 가이드</Text>

        {planData.itinerary &&
          planData.itinerary.map((dayItem: any, dayIdx: number) => (
            <View key={dayIdx} style={styles.scheduleCard}>
              {/* 일차 뱃지 (day: 1, 2, 3...) */}
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>DAY {dayItem.day}</Text>
              </View>

              {/* 해당 일차의 방문지 루프 */}
              {dayItem.places &&
                dayItem.places.map((place: any, pIdx: number) => (
                  <View key={pIdx} style={styles.placeRow}>
                    {/* 왼쪽 타임라인 인디케이터 */}
                    <View style={styles.timelineDotLine}>
                      <View style={styles.dot} />
                      {pIdx !== dayItem.places.length - 1 && (
                        <View style={styles.line} />
                      )}
                    </View>

                    {/* 오른쪽 장소 상세 정보 */}
                    <View style={styles.placeInfo}>
                      <View style={styles.placeTitleRow}>
                        <Text style={styles.placeName}>{place.place_name}</Text>
                      </View>

                      {/* 장소 소개 */}
                      <Text style={styles.placeDescription}>
                        {place.description}
                      </Text>

                      {/* 🌟 큐레이션 추천 이유 - 필드명이 proposed_reason 혹은 curation_reason인지 확인해 주세요! */}
                      {(place.proposed_reason || place.curation_reason) && (
                        <View style={styles.curationBox}>
                          <View style={styles.curationHeader}>
                            <Sparkles size={12} color="#2563EB" />
                            <Text style={styles.curationTitle}>
                              AI 추천 이유
                            </Text>
                          </View>
                          <Text style={styles.curationText}>
                            {place.proposed_reason || place.curation_reason}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          ))}

        {/* 하단 최종 돌아가기 / 확인 버튼 */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => router.replace("/plans")}
        >
          <Text style={styles.confirmBtnText}>목록으로</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => router.replace("/plans")}
        >
          <Text style={styles.confirmBtnText}>일정 보완하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  errorText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
    fontWeight: "500",
  },
  backBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },

  // 상단 네비바
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

  // 1. 메인 개요 카드
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

  // 2. 꿀팁 카드
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

  // 3. 일차별 타임라인 리스트
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

  // 타임라인 그리기 베이스 스타일
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

  // 장소 정보 정보 내부 레이아웃
  placeInfo: { flex: 1, paddingBottom: 20 },
  placeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    marginTop: 8,
  },
  placeName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  geoText: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  placeDescription: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },

  // 큐레이션 박스 스타일링
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

  // 하단 최종 가기 버튼
  confirmBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  confirmBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorSubText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },
});
