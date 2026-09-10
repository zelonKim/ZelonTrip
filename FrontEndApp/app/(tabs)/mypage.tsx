import { useState } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Award,
  Footprints,
  Megaphone,
  MessageSquare,
  ChevronRight,
  Moon,
} from "lucide-react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAppTheme } from "@/utils/ThemeContext";
import { useSendFeedback } from "@/hooks/useSendFeedback";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserTripStats } from "@/hooks/useUserTripStats";
import { logoutUser } from "@/utils/logoutUser";
import { useDeactivateUser } from "@/hooks/useDeactivateUser";
import { useUpdateNickname } from "@/hooks/useUpdateNickname";
import { NicknameModal } from "@/components/modals/NicknameModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isDarkMode, toggleDarkMode } = useAppTheme();

  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    header: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderBottomWidth: 1,
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    card: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    textSection: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    border: { borderColor: isDarkMode ? "#374151" : "#E5E7EB" },
    dividerLight: { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
    iconColor: isDarkMode ? "#9CA3AF" : "#4B5563",
    iconUserColor: isDarkMode ? "#60A5FA" : "#2563EB",
    avatarBg: { backgroundColor: isDarkMode ? "#374151" : "#EFF6FF" },
    badgeBg: {
      backgroundColor: isDarkMode ? "#374151" : "#EFF6FF",
      borderColor: isDarkMode ? "#4B5563" : "#DBEAFE",
    },
    badgeText: { color: isDarkMode ? "#60A5FA" : "#2563EB" },
    editBadgeBg: { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
    modalBg: { backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" },
    inputBg: {
      backgroundColor: isDarkMode ? "#111827" : "#F9FAFB",
      borderColor: isDarkMode ? "#374151" : "#D1D5DB",
    },
    cancelBtnBg: { backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" },
    placeholderColor: isDarkMode ? "#4B5563" : "#9CA3AF",
  };

  /////////////////////////////////////////////////////////////////////////////

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [inputNickname, setInputNickname] = useState("");
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const { data: profileData, isPending: isProfilePending } = useUserProfile();
  const { data: statsData, isPending: isStatsPending } = useUserTripStats();

  ///////////////////////////////////////////////////////////////////////////

  const handleFeedbackMenuPress = () => {
    setIsFeedbackModalVisible(true);
  };

  const { mutate: feedbackMutation, isPending: isFeedbackPending } =
    useSendFeedback({
      onSuccess: () => {
        setIsFeedbackModalVisible(false);
        setFeedbackText("");
      },
    });

  const handleSendFeedback = () => {
    const trimmedFeedback = feedbackText.trim();
    if (!trimmedFeedback) {
      Alert.alert("안내", "피드백 내용을 입력해 주세요.");
      return;
    }
    feedbackMutation(trimmedFeedback);
  };

  ///////////////////////////////////////////////////////////////////////////

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: logoutUser,
      },
    ]);
  };

  /////////////////////////////////////////////////////////////////////////////

  const { mutate: deactivateMutation, isPending: isDeactivatePending } =
    useDeactivateUser();

  const handleDeactivate = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까? \n탈퇴 시 서비스 이용이 제한됩니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: () => deactivateMutation(),
        },
      ],
    );
  };

  /////////////////////////////////////////////////////////////////////////////

  const openNicknameModal = () => {
    setInputNickname(profileData?.nickname || "");
    setIsModalVisible(true);
  };

  const { mutate: saveNicknameMutation, isPending: isSaveNicknamePending } =
    useUpdateNickname({
      onSuccess: () => {
        setIsModalVisible(false);
        setInputNickname("");
      },
    });

  const handleSaveNickname = () => {
    const trimmedNickname = inputNickname.trim();
    if (!trimmedNickname) {
      Alert.alert("안내", "닉네임을 입력해 주세요.");
      return;
    }
    saveNicknameMutation(trimmedNickname);
  };

  /////////////////////////////////////////////////////////////////////////////

  return (
    <View style={[styles.container, theme.container]}>
      <View
        style={[styles.header, theme.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={[styles.headerTitle, theme.textMain]}>마이페이지</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, theme.card]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, theme.avatarBg]}>
                <User size={28} color={theme.iconUserColor} />
              </View>
              <View style={styles.profileInfo}>
                {isProfilePending ? (
                  <ActivityIndicator
                    size="small"
                    color="#2563EB"
                    style={styles.loadingSpinner}
                  />
                ) : (
                  <>
                    {profileData?.nickname ? (
                      <View style={styles.nicknameContainer}>
                        <Text style={[styles.profileName, theme.textMain]}>
                          {profileData.nickname}
                        </Text>
                        <TouchableOpacity
                          style={[styles.editBadge, theme.editBadgeBg]}
                          onPress={openNicknameModal}
                        >
                          <Text style={[styles.editBadgeText, theme.textSub]}>
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
                    <Text style={[styles.profileEmail, theme.textSub]}>
                      {profileData?.username}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={[styles.dividerLight, theme.dividerLight]} />

          <View style={styles.badgeSection}>
            <View style={styles.badgeTitleRow}>
              <Award size={16} color={theme.iconColor} />
              <Text style={[styles.badgeSectionTitle, theme.textMain]}>
                취득한 뱃지
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.personaBadge, theme.badgeBg]}>
                <Text style={[styles.personaBadgeText, theme.badgeText]}>
                  {isStatsPending
                    ? "⏳ 분석 중..."
                    : (statsData?.total_location ?? 0) >= 5
                      ? "✈️ 프로 여행러"
                      : (statsData?.total_location ?? 0) >= 2
                        ? "👟 중급 여행러"
                        : "🐣 초보 여행러"}
                </Text>
              </View>

              {(statsData?.total_days ?? 0) > 0 && (
                <View style={[styles.personaBadge, theme.badgeBg]}>
                  <Text style={[styles.personaBadgeText, theme.badgeText]}>
                    ⏱️ 누적 {statsData?.total_days}일째 여행 중
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={{ marginTop: 2 }}></Text>

        <View style={[styles.menuGroupCard, theme.card]}>
          <View style={styles.statsRow}>
            <View style={styles.statsIconWrapper}></View>
            <View style={styles.statsContent}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Footprints size={18} color={theme.iconColor} />
                <Text
                  style={[
                    {
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 3,
                      marginLeft: 2,
                      includeFontPadding: false,
                    },
                    theme.textMain,
                  ]}
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
                <Text style={[styles.statsSubText, theme.textSub]}>
                  지금까지 ZelonTrip과 함께{" "}
                  <Text style={styles.highlightText}>
                    {statsData?.total_location ?? 0}개
                  </Text>
                  의 여행지 를 탐방했어요!
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, theme.textSection]}>
          앱 설정 및 지원
        </Text>
        <View style={[styles.menuGroupCard, theme.card]}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Moon size={20} color={theme.iconColor} />
              <Text style={[styles.menuText, theme.textMain]}>다크 모드</Text>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "#60A5FA" }}
              thumbColor={isDarkMode ? "#2563EB" : "#F3F4F6"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={toggleDarkMode}
              value={isDarkMode}
            />
          </View>

          <View style={[styles.dividerMenu, theme.border]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/notice")}
          >
            <View style={styles.menuItemLeft}>
              <Megaphone size={20} color={theme.iconColor} />
              <Text style={[styles.menuText, theme.textMain]}>공지사항</Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={[styles.dividerMenu, theme.border]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleFeedbackMenuPress}
          >
            <View style={styles.menuItemLeft}>
              <MessageSquare size={20} color={theme.iconColor} />
              <Text style={[styles.menuText, theme.textMain]}>
                피드백 보내기
              </Text>
            </View>
            <ChevronRight size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.accountManagementRow}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.accountText}>로그아웃</Text>
          </TouchableOpacity>
          <Text style={[styles.accountDivider, theme.border]}>|</Text>
          <TouchableOpacity onPress={handleDeactivate}>
            <Text style={styles.accountText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>

        {/* 앱 버전 정보 표시 */}
        <Text style={styles.versionText}>버전 정보 v1.0.0 (최신 버전)</Text>
      </ScrollView>

      <NicknameModal
        isVisible={isModalVisible}
        initialValue={profileData?.nickname ?? ""}
        isPending={isSaveNicknamePending}
        theme={theme}
        styles={styles}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveNickname}
      />

      <FeedbackModal
        isVisible={isFeedbackModalVisible}
        isPending={isFeedbackPending}
        theme={theme}
        styles={styles}
        onClose={() => setIsFeedbackModalVisible(false)}
        onSubmit={handleSendFeedback}
      />
    </View>
  );
}

/////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20 },
  profileCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: { marginLeft: 14, justifyContent: "center", flex: 1 },
  nicknameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  profileName: { fontSize: 18, fontWeight: "700" },
  editBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  editBadgeText: { fontSize: 11, fontWeight: "600" },
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
  setNicknameButtonText: { fontSize: 14, fontWeight: "600", color: "#2563EB" },
  profileEmail: { fontSize: 13, fontWeight: "500" },
  loadingSpinner: { alignSelf: "flex-start", marginTop: 4 },
  dividerLight: { height: 1, marginVertical: 14 },
  badgeSection: { width: "100%" },
  badgeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  badgeSectionTitle: { fontSize: 13, fontWeight: "600", marginLeft: 6 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  personaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  personaBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    includeFontPadding: false,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    paddingLeft: 2,
  },
  menuGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
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
  statsSubText: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  statsLoadingSpinner: { alignSelf: "flex-start", marginTop: 6 },
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
    marginLeft: 12,
    includeFontPadding: false,
  },
  dividerMenu: { height: 1 },
  accountManagementRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  accountText: { fontSize: 13, color: "#9CA3AF", fontWeight: "500" },
  accountDivider: { fontSize: 12, marginHorizontal: 12 },
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
    marginBottom: 12,
  },
  modalSubtitle: { fontSize: 13, marginBottom: 16 },
  nicknameInput: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtonRow: { flexDirection: "row", gap: 10, width: "100%" },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButton: {},
  modalCancelButtonText: { fontSize: 14, fontWeight: "600" },
  modalSaveButton: { backgroundColor: "#2563EB" },
  modalSaveButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  feedbackInput: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  keyboardAvoidingWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
