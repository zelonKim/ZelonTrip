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



export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();


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
      pathname: "/plan/[id]",
      params: { id },
    });
  };


  if (isPending) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          나의 여행 일정들을 불러오는 중... ✈️
        </Text>
      </View>
    );
  }

  // 💡 4. 네트워크 에러 발생 시 예외 처리
  if (isError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>일정을 불러오지 못했습니다. 😭</Text>
        <Text style={styles.errorSubText}>{error?.message}</Text>
      </View>
    );
  }

  const plans = data?.trips || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>나의 여행 일정 🗓️</Text>
          <Text style={styles.headerSubtitle}>
            AI가 생성한 맞춤형 여행 일정들이에요.
          </Text>
        </View>

        {/* 💡 5. 데이터가 빈 배열일 때(Empty State) 텅 화면 처리 */}
        {plans.length === 0 ? (
          <View style={styles.emptyBox}>
            <Inbox size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              아직 생성된 여행 일정이 없습니다.
            </Text>
            <Text style={styles.emptySubText}>
              첫 번째 AI 추천 일정을 생성해 보세요!
            </Text>
          </View>
        ) : (
          plans.map((plan: any) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => handlePlanPress(plan.id)}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.locationBadge}>
                  <MapPin size={14} color="#2563EB" />
                  <Text style={styles.locationText}>{plan.location}</Text>
                </View>
                {/* 💡 itinerary 배열의 길이를 활용해 'X박 Y일' 기간을 동적으로 연출 */}
                <View style={styles.dateRow}>
                  <CalendarDays size={13} color="#9CA3AF" />
                  <Text style={styles.dateText}>
                    {plan.itinerary?.length === 1
                      ? "당일치기 ☀️"
                      : `${plan.itinerary?.length - 1}박 ${plan.itinerary?.length}일`}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {plan.title}
              </Text>

              <View style={styles.overviewBox}>
                <Compass
                  size={16}
                  color="#6B7280"
                  style={styles.overviewIcon}
                />
                <Text style={styles.cardOverview} numberOfLines={3}>
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
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 4,
  },
  errorSubText: { fontSize: 13, color: "#9CA3AF" },

  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  headerSubtitle: { fontSize: 14, color: "#6B7280", lineHeight: 20 },

  // 텅 화면 스타일
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 6,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 10,
  },
  emptySubText: { fontSize: 13, color: "#9CA3AF" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 4,
  },
  dateRow: { flexDirection: "row", alignItems: "center" },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    lineHeight: 24,
  },
  overviewBox: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  overviewIcon: { marginTop: 2, marginRight: 8 },
  cardOverview: { flex: 1, fontSize: 13, color: "#4B5563", lineHeight: 18 },
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
