import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/utils/ThemeContext";
import { NotificationItem } from "@/types/NotificationItem";
import { NotificationCard } from "@/components/NotificationCard";

export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useAppTheme();

  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    header: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#1F2937" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#4B5563" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    iconWrapperBg: { backgroundColor: isDarkMode ? "#374151" : "#EFF6FF" },
    iconColor: isDarkMode ? "#60A5FA" : "#2563EB",
    headerIconColor: isDarkMode ? "#F9FAFB" : "#1F2937",
    trashIconColor: isDarkMode ? "#6B7280" : "#9CA3AF",
  };

  ///////////////////////////////////////////////////////////////

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = async () => {
    try {
      const data = await AsyncStorage.getItem("zelontrip_notifications");
      if (data) {
        console.log(data);
        setNotifications(JSON.parse(data));
      }
    } catch (error) {
      console.log("알림 로드 실패:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const clearAllNotifications = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem("zelontrip_notifications");
  };

  const deleteNotification = async (id: string) => {
    const updatedList = notifications.filter((item) => item.id !== id);
    setNotifications(updatedList);
    await AsyncStorage.setItem(
      "zelontrip_notifications",
      JSON.stringify(updatedList),
    );
  };

  ////////////////////////////////////////////////////////////////////////

  const handlePressItem = useCallback((planId?: number | string) => {
    if (planId) {
      router.push({
        pathname: "/(tabs)/plan/[id]",
        params: { id: planId },
      });
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationCard
        item={item}
        theme={theme}
        styles={styles}
        onPressItem={handlePressItem}
      />
    ),
    [theme, styles, handlePressItem, deleteNotification],
  );

  ////////////////////////////////////////////////////////////////////////

  return (
    <View
      style={[styles.container, theme.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, theme.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.headerIconColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme.textMain]}>알림함 🔔</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>전체 삭제</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                { color: isDarkMode ? "#4B5563" : "#9CA3AF" },
              ]}
            >
              도착한 알림이 없습니다.
            </Text>
          </View>
        }
      />
    </View>
  );
}

////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  clearAllText: { fontSize: 13, color: "#e92d2d", fontWeight: "500" },
  listContainer: { padding: 16 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateText: { flex: 1, fontSize: 12 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardBody: { fontSize: 13, lineHeight: 18 },
  emptyContainer: {
    paddingVertical: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 14 },
});
