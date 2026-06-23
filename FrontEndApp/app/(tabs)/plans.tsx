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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Compass,
  ArrowRight,
  CalendarDays,
  Inbox,
} from "lucide-react-native";
import { client } from "@/api/client";
import { useAppTheme } from "../_layout"; // 💡 루트 레이아웃 훅 가져오기

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useAppTheme(); // 💡 다크모드 상태

  // 💡 유기적 테마 객체
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    badgeBg: { backgroundColor: isDarkMode ? "#374151" : "#EFF6FF" },
    badgeText: { color: isDarkMode ? "#60A5FA" : "#2563EB" },
    overviewBox: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    iconColor: isDarkMode ? "#9CA3AF" : "#6B7280",
  };

  const fetchTripList = async () => {
    const response = await client.get("/v1/trip/list");
    return response.data;
  };

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["tripList"],
    queryFn: fetchTripList,
  });

  const handlePlanPress = (id: any) => {
    router.push({
      pathname: "/(tabs)/plan/[id]",
      params: { id },
    });
  };

  if (isPending) {
    return (
      <View style={[styles.container, styles.center, theme.container]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={[styles.loadingText, theme.textSub]}>
          나의 여행 일정들을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.center, theme.container]}>
        <Text style={styles.errorText}>일정을 불러오지 못했습니다. 😭</Text>
        <Text style={[styles.errorSubText, theme.textSub]}>
          {error?.message}
        </Text>
      </View>
    );
  }

  const plans = data?.trips || [];

  return (
    <View style={[styles.container, theme.container]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, theme.textMain]}>
            나의 여행 일정 🗓️
          </Text>
          <Text style={[styles.headerSubtitle, theme.textSub]}>
            AI가 생성한 맞춤형 여행 일정들이에요.
          </Text>
        </View>

        {plans.length === 0 ? (
          <View style={styles.emptyBox}>
            <Inbox size={40} color={isDarkMode ? "#374151" : "#9CA3AF"} />
            <Text style={[styles.emptyText, theme.textMain]}>
              아직 생성된 여행 일정이 없습니다.
            </Text>
            <Text style={[styles.emptySubText, theme.textSub]}>
              첫 번째 AI 추천 일정을 생성해 보세요!
            </Text>
          </View>
        ) : (
          plans.map((plan: any) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.card, theme.cardBg]}
              activeOpacity={0.8}
              onPress={() => handlePlanPress(plan.id)}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.locationBadge, theme.badgeBg]}>
                  <MapPin
                    size={14}
                    color={isDarkMode ? "#60A5FA" : "#2563EB"}
                  />
                  <Text style={[styles.locationText, theme.badgeText]}>
                    {plan.location}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <CalendarDays size={13} color="#9CA3AF" />
                  <Text style={[styles.dateText, theme.textSub]}>
                    {plan.itinerary?.length === 1
                      ? "당일치기 "
                      : `${plan.itinerary?.length - 1}박 ${plan.itinerary?.length}일`}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.cardTitle, theme.textMain]}
                numberOfLines={2}
              >
                {plan.title}
              </Text>

              <View style={[styles.overviewBox, theme.overviewBox]}>
                <Compass
                  size={16}
                  color={theme.iconColor}
                  style={styles.overviewIcon}
                />
                <Text
                  style={[styles.cardOverview, theme.textSub]}
                  numberOfLines={3}
                >
                  {plan.overview}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>일정 자세히 보기</Text>
                <ArrowRight size={14} color="#2563EB" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 14, fontWeight: "500" },
  errorText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 4,
  },
  errorSubText: { fontSize: 13 },
  header: { marginBottom: 24, marginTop: 16 },
  headerTitle: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 6,
  },
  emptyText: { fontSize: 15, fontWeight: "600", marginTop: 10 },
  emptySubText: { fontSize: 13 },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  locationText: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 12, marginLeft: 4, fontWeight: "500" },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    lineHeight: 24,
    paddingLeft: 10,
  },
  overviewBox: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  overviewIcon: { marginTop: 2, marginRight: 8 },
  cardOverview: { flex: 1, fontSize: 13, lineHeight: 18 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginRight: 4,
  },
});
