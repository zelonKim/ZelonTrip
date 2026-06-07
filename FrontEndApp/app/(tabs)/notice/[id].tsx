import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Calendar } from "lucide-react-native"; // 💡 아이콘 라이브러리에 맞게 변경 가능
import { client } from "@/api/client";

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
}

export default function NoticeDetailScreen() {
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: notice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NoticeDetail>({
    queryKey: ["noticeDetail", id],
    queryFn: async () => {
      const response = await client.get(`/v1/notice/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // 4. 로딩 화면
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>공지사항을 읽어오는 중입니다...</Text>
      </View>
    );
  }

  // 5. 에러 화면
  if (isError || !notice) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          공지사항을 불러오지 못했습니다.{"\n"}
          {error instanceof Error
            ? error.message
            : "존재하지 않는 공지사항입니다."}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>목록으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.push("/(tabs)/notice")}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          공지사항 상세
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 본문 스크롤 영역 */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 제목 섹션 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{notice.title}</Text>

          <View style={styles.metaRow}>
            <Calendar size={14} color="#9CA3AF" />
            <Text style={styles.date}>
              {new Date(notice.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 본문 내용 섹션 */}
        <View style={styles.contentSection}>
          {/* 💡 줄바꿈(\n)이 깔끔하게 렌더링되도록 기본 Text의 특성을 활용 */}
          <Text style={styles.content}>{notice.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // 본문 가독성을 위해 흰색 배경 배경
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
    alignItems: "flex-start",
  },
  importantBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  importantBadgeText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 30,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  contentSection: {
    minHeight: 200,
  },
  content: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24, // 💡 줄간격을 넉넉히 주어 가독성 확보
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
