import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Trash2, MessageSquare } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  planId: string | null;
}

export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 로컬 스토리지에서 알림 히스토리 로드
  const loadNotifications = async () => {
    try {
      const data = await AsyncStorage.getItem("zelontrip_notifications");
      if (data) {
        setNotifications(JSON.parse(data));
      }
    } catch (error) {
      console.log("알림 로드 실패:", error);
    }
  };

  // 특정 알림 개별 삭제
  const deleteNotification = async (id: string) => {
    const updatedList = notifications.filter((item) => item.id !== id);
    setNotifications(updatedList);
    await AsyncStorage.setItem(
      "zelontrip_notifications",
      JSON.stringify(updatedList),
    );
  };

  // 전체 알림 삭제
  const clearAllNotifications = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem("zelontrip_notifications");
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const formattedDate = new Date(item.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Pressable
        style={styles.card}
        onPress={() => {
          // 알림 클릭 시 등록된 플랜 상세 페이지로 연동 이동 (딥링크 역할 수행)
          if (item.planId) {
            router.push({
              pathname: "/(tabs)/plan/[id]",
              params: { id: item.planId },
            });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconWrapper}>
            <MessageSquare size={16} color="#2563EB" />
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <TouchableOpacity onPress={() => deleteNotification(item.id)}>
            <Trash2 size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody}>{item.body}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 커스텀 상단 헤더 내비게이션 바 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림함</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>전체 삭제</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* 알림 리스트 렌더링 영역 */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>도착한 알림이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  clearAllText: { fontSize: 13, color: "#e92d2d", fontWeight: "500" },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateText: { flex: 1, fontSize: 12, color: "#9CA3AF" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardBody: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
  emptyContainer: {
    paddingVertical: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#9CA3AF", fontSize: 14 },
});
