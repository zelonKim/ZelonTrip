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
  ActivityIndicator,
  Modal,
  TextInput,
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
  Moon,
} from "lucide-react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputNickname, setInputNickname] = useState("");

  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const feedbackMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await client.post("/v1/user/feedback", { content });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("✅ 접수 완료 ", "피드백이 성공적으로 접수되었습니다!");
      setIsFeedbackModalVisible(false);
      setFeedbackText("");
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail ||
        "피드백 전송에 실패했습니다. 다시 시도해 주세요.";
      Alert.alert("오류", errMsg);
    },
  });

  const handleSendFeedback = () => {
    const trimmedFeedback = feedbackText.trim();
    if (!trimmedFeedback) {
      Alert.alert("안내", "피드백 내용을 입력해 주세요.");
      return;
    }
    feedbackMutation.mutate(feedbackText);
  };

  const { data: userData, isPending: isUserPending } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const response = await client.get("/v1/auth/me");
      return response.data;
    },
  });

  const { data: statsData, isPending: isStatsPending } = useQuery({
    queryKey: ["userTripStats"],
    queryFn: async () => {
      const response = await client.get("/v1/user/stats");
      return response.data;
    },
  });

  const handleFeedbackMenuPress = () => {
    setIsFeedbackModalVisible(true);
  };

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
            router.replace("/(auth)/login");
          } catch (error) {
            Alert.alert("안내", "로그아웃 처리 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  const handleDeactivate = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? \n 탈퇴 시 서비스 이용이 제한됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            try {
              await client.patch("/v1/auth/deactivate");
              await SecureStore.deleteItemAsync("userToken");
              queryClient.clear();

              Alert.alert("안내", "그동안 서비스를 이용해 주셔서 감사합니다.", [
                {
                  text: "확인",
                  onPress: () => router.replace("/(auth)/login"),
                },
              ]);
            } catch (error: any) {
              const errMsg =
                error.response?.data?.detail || "서버 통신에 실패했습니다.";
              Alert.alert("탈퇴 실패", errMsg);
            }
          },
        },
      ],
    );
  };

  const openNicknameModal = () => {
    setInputNickname(userData?.nickname || "");
    setIsModalVisible(true);
  };

  const nicknameMutation = useMutation({
    mutationFn: async (newNickname: string) => {
      const response = await client.patch("/v1/user/nickname", {
        nickname: newNickname,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUserProfile"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          nickname: data.nickname,
        };
      });

      Alert.alert("성공", "닉네임이 성공적으로 설정되었습니다.");
      setIsModalVisible(false);
      setInputNickname("");

      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: (error: any) => {
      const errMsg =
        error.response?.data?.detail || "닉네임 저장에 실패했습니다.";
      Alert.alert("오류", errMsg);
    },
  });

  const handleSaveNickname = () => {
    const trimmedNickname = inputNickname.trim();
    if (!trimmedNickname) {
      Alert.alert("안내", "닉네임을 입력해 주세요.");
      return;
    }
    nicknameMutation.mutate(trimmedNickname);
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
                {isUserPending ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.loadingSpinner}
                  />
                ) : (
                  <>
                    {userData?.nickname ? (
                      <View style={styles.nicknameContainer}>
                        <Text style={styles.profileName}>
                          {userData.nickname}
                        </Text>
                        <TouchableOpacity
                          style={styles.editBadge}
                          onPress={openNicknameModal}
                        >
                          <Text style={styles.editBadgeText}>
                            닉네임 수정하기
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.setNicknameButton}
                        onPress={openNicknameModal}
                      >
                        <Text style={styles.setNicknameButtonText}>
                          닉네임 만들기 ✏️
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.profileEmail}>{userData.username}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.dividerLight} />
          {/* AI 취향 페르소나 배지 라인 */}
          <View style={styles.badgeSection}>
            <View style={styles.badgeTitleRow}>
              <Award size={16} color={"#374151"} />
              <Text style={styles.badgeSectionTitle}>취득한 뱃지</Text>
            </View>
            <View style={styles.badgeRow}>
              {/* 1. 방문 도시 수에 따른 등급 배지 */}
              <View style={styles.personaBadge}>
                <Text style={styles.personaBadgeText}>
                  {isStatsPending
                    ? "⏳ 분석 중..."
                    : statsData?.total_location >= 5
                      ? "✈️ 프로 여행러"
                      : statsData?.total_location >= 2
                        ? "👟 중급 여행러"
                        : "🐣 초보 여행러"}
                </Text>
              </View>

              {/* 2. 총 누적 일수 기반 배지 */}
              {(statsData?.total_days ?? 0) > 0 && (
                <View style={styles.personaBadge}>
                  <Text style={styles.personaBadgeText}>
                    ⏱️ 누적 {statsData?.total_days}일째 여행 중
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={{ marginTop: 2 }}></Text>
        <View style={styles.menuGroupCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsIconWrapper}></View>

            <View style={styles.statsContent}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Footprints size={18} color="#4B5563" />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 3,
                    marginLeft: 2,
                    includeFontPadding: false,
                  }}
                >
                  나의 여행 발자국
                </Text>
              </View>

              {isStatsPending ? (
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                  style={styles.statsLoadingSpinner}
                />
              ) : (
                <Text style={styles.statsSubText}>
                  지금까지 ZelonTrip과 함께{" "}
                  <Text style={styles.highlightText}>
                    {statsData?.total_location ?? 0}개의 여행지
                  </Text>
                  를{"\n"}탐방했어요!
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ⚙️ [3. 앱 설정 및 지원] */}
        <Text style={styles.sectionTitle}>앱 설정 및 지원</Text>
        <View style={styles.menuGroupCard}>
          {/* 알림 설정 */}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Moon size={20} color="#4B5563" />
              <Text style={styles.menuText}>어두운 배경</Text>
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
            onPress={() => router.push("/(tabs)/notice")}
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
            onPress={handleFeedbackMenuPress}
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
          <TouchableOpacity onPress={handleDeactivate}>
            <Text style={styles.accountText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* 앱 버전 정보 표시 */}
        <Text style={styles.versionText}>버전 정보 v1.0.0 (최신 버전)</Text>
      </ScrollView>

      {/* 닉네임 팝업 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>닉네임 설정</Text>
            <Text style={styles.modalSubtitle}>
              새로운 닉네임을 입력해 주세요.
            </Text>

            <TextInput
              style={styles.nicknameInput}
              placeholder="닉네임 입력"
              placeholderTextColor="#9CA3AF"
              value={inputNickname}
              onChangeText={setInputNickname}
              maxLength={15}
              autoFocus={true}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsModalVisible(false)}
                disabled={nicknameMutation.isPending}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveNickname}
                disabled={nicknameMutation.isPending}
              >
                {nicknameMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isFeedbackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 50}
            style={styles.keyboardAvoidingWrapper}
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>💬 피드백 보내기 </Text>
              <Text style={styles.modalSubtitle}>
                ZelonTrip을 이용하면서 좋았던 점이나 {"\n"}불편했던 점을
                자유롭게 작성해주세요.
              </Text>

              <TextInput
                style={styles.feedbackInput}
                placeholder="여기에 내용을 입력해 주세요 (최대 300자)"
                placeholderTextColor="#9CA3AF"
                value={feedbackText}
                onChangeText={setFeedbackText}
                maxLength={300}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus={true}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setIsFeedbackModalVisible(false);
                    setFeedbackText("");
                  }}
                  disabled={feedbackMutation.isPending}
                >
                  <Text style={styles.modalCancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={handleSendFeedback}
                  disabled={feedbackMutation.isPending}
                >
                  {feedbackMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>보내기</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  profileInfo: { marginLeft: 14, justifyContent: "center", flex: 1 },
  nicknameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  editBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  editBadgeText: { fontSize: 11, color: "#6B7280", fontWeight: "600" },

  setNicknameButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  setNicknameButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },
  profileEmail: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  loadingSpinner: { alignSelf: "flex-start", marginTop: 4 },
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
    marginLeft: 6,
    color: "#374151",
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
    paddingLeft: 2,
  },

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

  statsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  statsIconWrapper: { marginRight: 6 },
  statsContent: { flex: 1 },
  statsSubText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  statsLoadingSpinner: { alignSelf: "flex-start", marginTop: 6 }, // 💡 통계용 로딩 스피너 스타일 추가
  highlightText: { color: "#2563EB", fontWeight: "600" },

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

  accountManagementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,

    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  modalSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 16 },
  nicknameInput: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  modalButtonRow: { flexDirection: "row", gap: 10, width: "100%" },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButton: { backgroundColor: "#F3F4F6" },
  modalCancelButtonText: { color: "#4B5563", fontSize: 14, fontWeight: "600" },
  modalSaveButton: { backgroundColor: "#2563EB" },
  modalSaveButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  feedbackInput: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoidingWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
