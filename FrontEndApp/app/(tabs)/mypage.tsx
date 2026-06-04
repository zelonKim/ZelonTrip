import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  ActivityIndicator, // 💡 로딩 인디케이터 추가
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Award,
  Footprints,
  Bell,
  Megaphone,
  MessageSquare,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // 💡 useQuery 추가
import { client } from "@/api/client";

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // 알림 설정 상태 관리
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  // 💡 1. 백엔드 /v1/auth/me API와 연동하는 실시간 프로필 조회 쿼리
  const { data: userData, isPending } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/auth/me");
      return response.data;
    },
  });

  // 메뉴 클릭 이벤트 핸들러
  const handleMenuPress = (menuTitle: string) => {
    console.log(`${menuTitle} 메뉴 클릭됨`);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("userToken");
            queryClient.clear();
            router.replace("/login");
          } catch (error) {
            console.error("로그아웃 처리 중 에러:", error);
            Alert.alert("안내", "로그아웃 처리 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 영역 */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 👣 [1. 프로필 & 취향 배지 영역] */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <User size={28} color="#2563EB" />
              </View>
              <View style={styles.profileInfo}>
                {/* 💡 2. 로딩 중일 때와 데이터가 로드되었을 때의 조건부 렌더링 */}
                {isPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.loadingSpinner}
                  />
                ) : (
                  <>
                    <Text style={styles.profileName}>
                      {userData?.nickname
                        ? `${userData.nickname}님`
                        : "닉네임"}
                    </Text>
                    <Text style={styles.profileEmail}>
                      {userData?.username}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.dividerLight} />

          {/* AI 취향 페르소나 배지 라인 */}
          <View style={styles.badgeSection}>
            <View style={styles.badgeTitleRow}>
              <Award size={16} color="#2563EB" />
              <Text style={styles.badgeSectionTitle}>나의 여행 성향</Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={styles.personaBadge}>
                <Text style={styles.personaBadgeText}>
                  ⚡️ {userData?.mbti || "INFJ"}
                </Text>
              </View>
              <View style={styles.personaBadge}>
                <Text style={styles.personaBadgeText}>🚗 자차 선호</Text>
              </View>
              <View style={styles.personaBadge}>
                <Text style={styles.personaBadgeText}>🏃 페이스 8/10</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 👣 [2. 나의 여행 활동] */}
        <Text style={styles.sectionTitle}>나의 여행 활동</Text>
        <View style={styles.menuGroupCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsIconWrapper}>
              <Footprints size={20} color="#4B5563" />
            </View>
            <View style={styles.statsContent}>
              <Text style={styles.menuText}>나의 여행 발자국 통계</Text>
              <Text style={styles.statsSubText}>
                지금까지 AI와 함께{" "}
                <Text style={styles.highlightText}>3개 도시</Text>,{" "}
                <Text style={styles.highlightText}>8박 9일</Text>을 탐방했어요!
              </Text>
            </View>
          </View>
        </View>

        {/* ⚙️ [3. 앱 설정 및 지원] */}
        <Text style={styles.sectionTitle}>앱 설정 및 지원</Text>
        <View style={styles.menuGroupCard}>
          {/* 알림 설정 (토글 스위치 형태) */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color="#4B5563" />
              <Text style={styles.menuText}>알림 설정</Text>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
              thumbColor={isNotificationEnabled ? "#2563EB" : "#F3F4F6"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={setIsNotificationEnabled}
              value={isNotificationEnabled}
            />
          </View>

          <View style={styles.dividerMenu} />

          {/* 공지사항 */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("공지사항")}
          >
            <View style={styles.menuItemLeft}>
              <Megaphone size={20} color="#4B5563" />
              <Text style={styles.menuText}>공지사항</Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.dividerMenu} />

          {/* 피드백 보내기 */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuPress("피드백 보내기")}
          >
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color="#4B5563" />
              <Text style={styles.menuText}>피드백 보내기</Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* 🔒 [4. 계정 관리] */}
        <View style={styles.accountManagementRow}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.accountText}>로그아웃</Text>
          </TouchableOpacity>
          <Text style={styles.accountDivider}>|</Text>
          <TouchableOpacity onPress={() => handleMenuPress("회원탈퇴")}>
            <Text style={styles.accountText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* 앱 버전 정보 표시 */}
        <Text style={styles.versionText}>버전 정보 v1.0.0 (최신 버전)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },

  // 1. 프로필 카드 스타일
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { marginLeft: 14, justifyContent: "center" },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  profileEmail: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  loadingSpinner: { alignSelf: "flex-start", marginTop: 4 }, // 💡 스피너 정렬 스타일 추가
  dividerLight: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 14 },
  badgeSection: { width: "100%" },
  badgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  badgeSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 6,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  personaBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  personaBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
    includeFontPadding: false,
  },

  // 섹션 타이틀 공통
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
    paddingLeft: 2,
  },

  // 메뉴 그룹 박스 (공통 카드화)
  menuGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    marginBottom: 24,
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

  // 2. 여행 활동 특정 스타일
  statsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  statsIconWrapper: { marginRight: 12 },
  statsContent: { flex: 1 },
  statsSubText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  highlightText: { color: "#2563EB", fontWeight: "600" },

  // 3. 메뉴 아이템 레이아웃
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
    includeFontPadding: false,
  },
  dividerMenu: { height: 1, backgroundColor: "#E5E7EB" },

  // 4. 계정 관리 링크 영역
  accountManagementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  accountText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  accountDivider: { fontSize: 12, color: "#E5E7EB", marginHorizontal: 12 },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
});
