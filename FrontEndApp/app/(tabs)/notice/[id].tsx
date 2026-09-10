import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, ChevronLeft } from "lucide-react-native";
import { useAppTheme } from "../../_layout";
import { getNoticeDetail } from "@/api/notice/getNoticeDetail";
import { NoticeDetail } from "@/types/NoticeDetail";

export default function NoticeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useAppTheme();

  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#FFFFFF" },
    header: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#F3F4F6",
    },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    textContent: { color: isDarkMode ? "#D1D5DB" : "#374151" },
    divider: { backgroundColor: isDarkMode ? "#374151" : "#E5E7EB" },
    badgeBg: { backgroundColor: isDarkMode ? "#2D1919" : "#FEE2E2" },
    badgeText: { color: isDarkMode ? "#FCA5A5" : "#EF4444" },
    iconColor: isDarkMode ? "#9CA3AF" : "#111827",
    indicatorColor: isDarkMode ? "#60A5FA" : "#3B82F6",
  };

  ///////////////////////////////////////////////////////////////////////////////

  const {
    data: notice,
    isLoading,
    isError,
    error,
  } = useQuery<NoticeDetail>({
    queryKey: ["noticeDetail", id],
    queryFn: () => getNoticeDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, theme.container]}>
        <ActivityIndicator size="large" color={theme.indicatorColor} />
        <Text style={[styles.loadingText, theme.textSub]}>
          공지사항을 읽어오는 중입니다...
        </Text>
      </View>
    );
  }

  if (isError || !notice) {
    return (
      <View style={[styles.centerContainer, theme.container]}>
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

  //////////////////////////////////////////////////////////////////////

  return (
    <View style={[styles.container, theme.container]}>
      <View
        style={[styles.header, theme.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.push("/(tabs)/notice")}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.iconColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textMain]} numberOfLines={1}>
          공지사항 상세
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          {notice.is_important && (
            <View style={[styles.importantBadge, theme.badgeBg]}>
              <Text style={[styles.importantBadgeText, theme.badgeText]}>
                중요
              </Text>
            </View>
          )}

          <Text style={[styles.title, theme.textMain]}>{notice.title}</Text>

          <View style={styles.metaRow}>
            <Calendar size={14} color="#9CA3AF" />
            <Text style={[styles.date, theme.textSub]}>
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

        <View style={[styles.divider, theme.divider]} />

        <View style={styles.contentSection}>
          <Text style={[styles.content, theme.textContent]}>
            {notice.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

///////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  importantBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
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
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  contentSection: {
    minHeight: 200,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
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
