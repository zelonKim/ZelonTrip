import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { client } from "@/api/client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native"; // 💡 뒤로가기 아이콘 추가
import { useAppTheme } from "../../_layout";

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const fetchNotices = async (): Promise<Notice[]> => {
  const response = await client.get("/v1/notice");
  return response.data;
};

export default function NoticePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useAppTheme();

  // 💡 공지사항 화면 맞춤 유기적 테마 객체
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    header: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    iconColor: isDarkMode ? "#9CA3AF" : "#111827", // 💡 헤더 아이콘 컬러 추가
    indicatorColor: isDarkMode ? "#60A5FA" : "#3B82F6",
  };

  const {
    data: notices,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: fetchNotices,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderNoticeItem = ({ item }: { item: Notice }) => {
    return (
      <TouchableOpacity
        style={[styles.card, theme.cardBg]}
        onPress={() => router.push(`/(tabs)/notice/${item.id}`)}
      >
        <Text style={[styles.date, theme.textSub]}>
          {new Date(item.created_at).toLocaleDateString("ko-KR")}
        </Text>

        <Text style={[styles.title, theme.textMain]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.summary, theme.textSub]} numberOfLines={2}>
          {item.content}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, theme.container]}>
        <ActivityIndicator size="large" color={theme.indicatorColor} />
        <Text style={[styles.loadingText, theme.textSub]}>
          공지사항을 불러오는 중입니다..
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centerContainer, theme.container]}>
        <Text style={styles.errorText}>
          공지사항을 불러오지 못했습니다.{"\n"}
          {error instanceof Error ? error.message : "다시 시도해 주세요."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme.container]}>
      {/* 💡 상단 헤더 영역 수정 (좌측 뒤로가기 버튼 배치 및 정렬) */}
      <View
        style={[styles.header, theme.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)/mypage")}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.iconColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, theme.textMain]}>공지사항 📢</Text>

        {/* 우측 밸런스를 맞추기 위한 빈 뷰 */}
        <View style={styles.headerRightPlaceholder} />
      </View>

      <FlatList
        data={notices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNoticeItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.indicatorColor]}
            tintColor={theme.indicatorColor}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, theme.textSub]}>
              등록된 공지사항이 없습니다.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row", // 💡 가로 배치
    alignItems: "center",
    justifyContent: "space-between", // 💡 양쪽 정렬로 중앙 타이틀 유지
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18, // 💡 헤더 내비바 룩앤필에 맞춰 폰트 사이즈 조정
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40, // 💡 backButton과 동일한 크기로 지정해서 타이틀이 완벽히 중앙에 오도록 처리
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
  },
  date: {
    fontSize: 12,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
  },
});
