import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Plane,
  Calendar,
  User,
  Compass,
  Users,
  Car,
  Gauge,
  Sparkles,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { client } from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/services/notifications";
import { getDeviceId } from "@/services/helpers";
import { useAppTheme } from "../_layout"; // 💡 루트 레이아웃에서 전역 다크모드 훅 가져오기

// 옵션 데이터 상수 정의
const MBTI_OPTIONS = [
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];
const COMPANION_OPTIONS = [
  "혼자",
  "친구와",
  "연인과",
  "가족과",
  "아이와",
  "부모님과",
];
const TRANSPORT_OPTIONS = ["대중교통", "자차/렌트카", "도보", "자전거"];

const TRIP_STYLE_TAGS = [
  "🎯 명소 탐방",
  "☕️ 힙한 카페 투어",
  "🌿 힐링·자연",
  "🏃 액티비티·체험",
  "🛍️ 쇼핑 중심",
  "📸 인스타 감성",
  "🎨 전시·문화",
];
const TENDENCY_TAGS = [
  "💸 가성비 중시",
  "👑 럭셔리·호캉스",
  "🍺 음주 가능",
  "🤫 숨겨진 맛집",
  "🛌 깔끔한 숙소 필수",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { isDarkMode } = useAppTheme(); // 💡 다크모드 상태 구독

  // 💡 유기적 다크모드 테마 컬러 매핑 오버라이딩 객체
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#6B7280" },
    textLabel: { color: isDarkMode ? "#E5E7EB" : "#374151" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    inputBg: {
      backgroundColor: isDarkMode ? "#111827" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#D1D5DB",
      color: isDarkMode ? "#F9FAFB" : "#111827",
    },
    chipBg: {
      backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
    },
    chipText: {
      color: isDarkMode ? "#D1D5DB" : "#4B5563",
    },
    activeChipBg: {
      backgroundColor: isDarkMode ? "rgba(37, 99, 235, 0.15)" : "#EFF6FF",
      borderColor: "#2563EB",
    },
    activeChipText: {
      color: isDarkMode ? "#60A5FA" : "#2563EB",
    },
    dividerLine: {
      backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    counterBtnBg: {
      backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
    },
    counterBtnText: {
      color: isDarkMode ? "#F9FAFB" : "#374151",
    },
  };

  const [cachedPushToken, setCachedPushToken] = useState<string | null>(null);
  const [cachedDeviceId, setCachedDeviceId] = useState<string | null>(null);

  const notificationsListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    const prepareNotificationTokens = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        const deviceId = await getDeviceId();
        if (token) setCachedPushToken(token);
        if (deviceId) setCachedDeviceId(deviceId);
      } catch (error) {
        console.log("초기 토큰 준비 실패 (알림 권한 미허용 등):", error);
      }
    };

    prepareNotificationTokens();

    notificationsListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("알림 수신:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("알림 클릭:", response);
        const planId = response.notification.request.content.data?.planId;
        if (planId) {
          Linking.openURL(`zelontrip://plan/${planId}`);
        }
      });

    return () => {
      notificationsListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendSuccessNotification = (planId: string) => {
    if (!cachedPushToken || !cachedDeviceId) {
      console.log("미리 준비된 푸시 토큰이 없어 알림 발송을 건너뜁니다.");
      return;
    }

    client
      .post("/v1/notification", {
        pushToken: cachedPushToken,
        deviceId: cachedDeviceId,
        planId,
        contents: {
          title: "생성 완료 🤗",
          body: `${location} 여행 플랜이 생성되었습니다`,
          message: "AI가 생성한 여행 플랜을 보완할 수도 있어요.",
        },
      })
      .catch((err) => {
        console.log("=== 🚨 푸시 알림 요청 실패 상세 로그 ===");
        if (err.response) {
          console.log("상태 코드 (Status):", err.response.status);
          console.log(
            "서버 에러 상세 (Data):",
            JSON.stringify(err.response.data, null, 2),
          );
        } else if (err.request) {
          console.log("요청 전송 성공했으나 응답 없음 (Request):", err.request);
        } else {
          console.log("에러 메시지 (Message):", err.message);
        }
        console.log("전체 에러 오브젝트:", err.config);
        console.log("=======================================");
      });
  };

  // 입력 데이터 상태 관리
  const [location, setLocation] = useState("");
  const [days, setDays] = useState<number>(1);
  const [mbti, setMbti] = useState("");
  const [tripStyle, setTripStyle] = useState("");
  const [tendency, setTendency] = useState("");
  const [asking, setAsking] = useState("");
  const [companion, setCompanion] = useState("");
  const [transportation, setTransportation] = useState("");
  const [pace, setPace] = useState<number>(5);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await client.post("/v1/trip/generate", requestData);
      return response.data;
    },
    onSuccess: (res) => {
      sendSuccessNotification(res.id);
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      queryClient.invalidateQueries({ queryKey: ["tripDetail", res.id] });
      queryClient.invalidateQueries({ queryKey: ["userTripStats"] });
      queryClient.invalidateQueries({ queryKey: ["tripRecommend"] });
      setLocation("");

      Alert.alert(
        "일정 생성 완료 🎉",
        "AI가 여행 일정 생성을 완료하였습니다.",
        [
          {
            text: "확인하러 가기",
            onPress: () => {
              router.push({
                pathname: "/(tabs)/plan/[id]",
                params: { id: res.id },
              });
            },
          },
        ],
        { cancelable: false },
      );
    },
    onError: (error) => {
      Alert.alert(
        "에러",
        "일정 생성 중 문제가 발생했습니다. 다시 시도해 주세요.",
      );
    },
  });

  const handleGenerate = () => {
    if (!location.trim()) {
      Alert.alert("안내", "여행지를 입력해 주세요.");
      return;
    }
    if (!mbti) {
      Alert.alert("안내", "MBTI를 선택해 주세요.");
      return;
    }
    if (!tripStyle) {
      Alert.alert("안내", "여행 스타일을 선택해 주세요.");
      return;
    }
    if (!tendency) {
      Alert.alert("안내", "식당 및 숙소 성향을 선택해 주세요.");
      return;
    }
    if (!companion) {
      Alert.alert("안내", "누구와 함께하는지 선택해 주세요.");
      return;
    }
    if (!transportation) {
      Alert.alert("안내", "주요 이동 수단을 선택해 주세요.");
      return;
    }

    mutate({
      location,
      days,
      mbti,
      tripStyle,
      tendency,
      asking,
      companion,
      transportation,
      pace,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, theme.container]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 10 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, theme.textMain]}>
            AI 맞춤 여행 생성 ✨
          </Text>
          <Text style={[styles.headerSubtitle, theme.textSub]}>
            취향 태그를 고르고 특별한 요청사항을 입력해 보세요.
          </Text>
        </View>

        {/* 1. 목적지 입력 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <Plane size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>여행지</Text>
          </View>
          <TextInput
            style={[styles.input, theme.inputBg]}
            placeholder="어디로 떠나시나요? (예: 도쿄, 뉴욕)"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* 2. 여행 기간 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <Calendar size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>여행 기간</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, theme.counterBtnBg]}
              onPress={() => setDays(Math.max(0, days - 1))}
            >
              <Text style={[styles.counterBtnText, theme.counterBtnText]}>
                -
              </Text>
            </TouchableOpacity>
            <Text style={[styles.counterText, theme.textMain]}>
              {days === 0 ? "당일치기" : `${days}박 ${days + 1}일`}
            </Text>
            <TouchableOpacity
              style={[styles.counterBtn, theme.counterBtnBg]}
              onPress={() => setDays(days + 1)}
            >
              <Text style={[styles.counterBtnText, theme.counterBtnText]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MBTI 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <User size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>나의 MBTI</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {MBTI_OPTIONS.map((item) => {
              const isSelected = mbti === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    theme.chipBg,
                    isSelected && theme.activeChipBg,
                  ]}
                  onPress={() => setMbti(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      theme.chipText,
                      isSelected && theme.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. 여행 취향 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <Compass size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>
              어떤 여행을 원하시나요? (중복 가능)
            </Text>
          </View>

          <Text style={[styles.subLabel, theme.textSub, { marginTop: 12 }]}>
            여행 스타일
          </Text>
          <View style={styles.tagGridRow}>
            {TRIP_STYLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagBtn,
                    theme.chipBg,
                    isSelected && theme.activeChipBg,
                  ]}
                  onPress={() => {
                    toggleTag(tag);
                    setTripStyle(tag);
                  }}
                >
                  <Text
                    style={[
                      styles.tagBtnText,
                      theme.chipText,
                      isSelected && theme.activeChipText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, theme.textSub, { marginTop: 14 }]}>
            식당 · 숙소 성향
          </Text>
          <View style={styles.tagGridRow}>
            {TENDENCY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagBtn,
                    theme.chipBg,
                    isSelected && theme.activeChipBg,
                  ]}
                  onPress={() => {
                    toggleTag(tag);
                    setTendency(tag);
                  }}
                >
                  <Text
                    style={[
                      styles.tagBtnText,
                      theme.chipText,
                      isSelected && theme.activeChipText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.divider, theme.dividerLine]} />
          <View style={styles.labelRowSmall}>
            <Sparkles size={16} color="#2563EB" />
            <Text style={[styles.labelSmall, theme.textLabel]}>
              나만의 특별 요청사항 (선택)
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, theme.inputBg]}
            placeholder="예: 교통이 편한 곳 위주로 관광 코스를 짜주세요."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={asking}
            onChangeText={setAsking}
          />
        </View>

        {/* 5. 동반자 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <Users size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>
              누구와 함께하나요?
            </Text>
          </View>
          <View style={styles.gridRow}>
            {COMPANION_OPTIONS.map((item) => {
              const isSelected = companion === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.gridBtnThreeColumn,
                    theme.chipBg,
                    isSelected && theme.activeChipBg,
                  ]}
                  onPress={() => setCompanion(item)}
                >
                  <Text
                    style={[
                      styles.gridBtnText,
                      theme.chipText,
                      isSelected && theme.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. 이동 수단 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRow}>
            <Car size={20} color="#2563EB" />
            <Text style={[styles.label, theme.textLabel]}>주요 이동 수단</Text>
          </View>
          <View style={styles.gridRow}>
            {TRANSPORT_OPTIONS.map((item) => {
              const isSelected = transportation === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.gridBtnTwoColumn,
                    theme.chipBg,
                    isSelected && theme.activeChipBg,
                  ]}
                  onPress={() => setTransportation(item)}
                >
                  <Text
                    style={[
                      styles.gridBtnText,
                      theme.chipText,
                      isSelected && theme.activeChipText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 7. 일정 페이스 선택 */}
        <View style={[styles.card, theme.cardBg]}>
          <View style={styles.labelRowContainer}>
            <View style={styles.labelRow}>
              <Gauge size={20} color="#2563EB" />
              <Text style={[styles.label, theme.textLabel]}>
                여행 일정 페이스
              </Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>{pace} / 10</Text>
            </View>
          </View>
          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={pace}
              onValueChange={setPace}
              minimumTrackTintColor="#2563EB"
              maximumTrackTintColor={isDarkMode ? "#4B5563" : "#E5E7EB"}
              thumbTintColor="#2563EB"
            />
            <View style={styles.sliderLimitRow}>
              <Text style={[styles.sliderLimitText, theme.textSub]}>
                1 (여유)
              </Text>
              <Text style={[styles.sliderLimitText, theme.textSub]}>
                10 (빡빡)
              </Text>
            </View>
          </View>
        </View>

        {/* 제출 버튼 */}
        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.disabledBtn]}
          onPress={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.waiting}>
              <Text style={styles.submitBtnText}>여행 일정 생성 중 </Text>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.spinner}
              />
            </View>
          ) : (
            <Text style={styles.submitBtnText}>여행 일정 생성하기 🤖</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  headerTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  labelRow: { flexDirection: "row", alignItems: "center" },
  labelRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 15, fontWeight: "600", marginLeft: 8 },
  subLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    paddingLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 12,
  },
  textArea: { height: 80, paddingTop: 10, marginTop: 0 },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: { fontSize: 20, fontWeight: "600" },
  counterText: { fontSize: 16, fontWeight: "600" },
  chipScroll: { flexDirection: "row", marginTop: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipText: { fontSize: 14, fontWeight: "500" },
  tagGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    width: "100%",
    marginTop: 4,
  },
  tagBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagBtnText: {
    fontSize: 13,
    fontWeight: "500",
    includeFontPadding: false,
  },
  divider: { height: 1, marginVertical: 16 },
  labelRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    marginTop: 12,
  },
  gridBtnThreeColumn: {
    width: "31.5%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  gridBtnTwoColumn: {
    width: "48.5%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  gridBtnText: {
    fontSize: 14,
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 18,
  },
  scoreBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  sliderWrapper: { width: "100%", marginVertical: 8 },
  slider: { width: "100%", height: 40 },
  sliderLimitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: -4,
  },
  sliderLimitText: { fontSize: 11, fontWeight: "500" },
  submitBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  spinner: { marginLeft: 4 },
  disabledBtn: {
    backgroundColor: "#9CA3AF",
    shadowColor: "transparent",
    elevation: 0,
  },
  waiting: { flexDirection: "row", alignItems: "center", gap: 8 },
});
