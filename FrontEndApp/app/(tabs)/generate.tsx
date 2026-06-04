import React, { useState } from "react";
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

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();

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

  const queryClient = useQueryClient();

  // AI 여행 일정 생성 처리
  const { mutate, isPending } = useMutation({
    mutationFn: async (requestData: any) => {
      const response = await client.post("/v1/trip/generate", requestData);
      return response.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tripDetail", res.id] });
      queryClient.invalidateQueries({ queryKey: ["tripList"] });
      
      Alert.alert(
        "일정 생성 완료 🎉",
        "AI가 여행 일정 생성을 완료하였습니다.",
        [
          {
            text: "확인하러 가기",
            onPress: () => {
              router.push({
                pathname: "/plan/[id]",
                params: { id: res.id },
              });
            },
          },
        ],
        { cancelable: false },
      );
    },
    onError: (error) => {
      console.error("AI 일정 생성 실패!", error);
      Alert.alert(
        "에러",
        "일정 생성 중 문제가 발생했습니다. 다시 시도해 주세요.",
      );
    },
  });

  // 💡 버튼을 눌렀을 때 실행되는 유효성 검사 로직
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
      style={styles.container}
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
          <Text style={styles.headerTitle}>AI 맞춤 여행 생성 ✨</Text>
          <Text style={styles.headerSubtitle}>
            취향 태그를 고르고 특별한 요청사항을 입력해 보세요.
          </Text>
        </View>

        {/* 1. 목적지 입력 */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Plane size={20} color="#2563EB" />
            <Text style={styles.label}>여행지</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="어디로 떠나시나요? (예: 파리, 뉴욕, 도쿄)"
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* 2. 여행 기간 선택 */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Calendar size={20} color="#2563EB" />
            <Text style={styles.label}>여행 기간</Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setDays(Math.max(0, days - 1))}
            >
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterText}>
              {days === 0 ? "당일치기" : `${days}박 ${days + 1}일`}
            </Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setDays(days + 1)}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MBTI 선택 */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <User size={20} color="#2563EB" />
            <Text style={styles.label}>나의 MBTI</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {MBTI_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, mbti === item && styles.activeChip]}
                onPress={() => setMbti(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    mbti === item && styles.activeChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. 여행 취향 선택 (하이브리드 구조) */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Compass size={20} color="#2563EB" />
            <Text style={styles.label}>
              어떤 여행을 원하시나요? (중복 가능)
            </Text>
          </View>

          <Text style={[styles.subLabel, { marginTop: 12 }]}>여행 스타일</Text>
          <View style={styles.tagGridRow}>
            {TRIP_STYLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagBtn, isSelected && styles.activeTagBtn]}
                  onPress={() => {
                    toggleTag(tag);
                    setTripStyle(tag);
                  }}
                >
                  <Text
                    style={[
                      styles.tagBtnText,
                      isSelected && styles.activeTagBtnText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 14 }]}>
            식당 · 숙소 성향
          </Text>
          <View style={styles.tagGridRow}>
            {TENDENCY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagBtn, isSelected && styles.activeTagBtn]}
                  onPress={() => {
                    toggleTag(tag);
                    setTendency(tag);
                  }}
                >
                  <Text
                    style={[
                      styles.tagBtnText,
                      isSelected && styles.activeTagBtnText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />
          <View style={styles.labelRowSmall}>
            <Sparkles size={16} color="#2563EB" />
            <Text style={styles.labelSmall}>나만의 특별 요청사항 (선택)</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="예: 숙소 주변에 치안이 좋은 곳 위주로 짜주세요!"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            value={asking}
            onChangeText={setAsking}
          />
        </View>

        {/* 5. 동반자 선택 */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Users size={20} color="#2563EB" />
            <Text style={styles.label}>누구와 함께하나요?</Text>
          </View>
          <View style={styles.gridRow}>
            {COMPANION_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.gridBtnThreeColumn,
                  companion === item && styles.activeGridBtn,
                ]}
                onPress={() => setCompanion(item)}
              >
                <Text
                  style={[
                    styles.gridBtnText,
                    companion === item && styles.activeGridBtnText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. 이동 수단 선택 */}
        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Car size={20} color="#2563EB" />
            <Text style={styles.label}>주요 이동 수단</Text>
          </View>
          <View style={styles.gridRow}>
            {TRANSPORT_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.gridBtnTwoColumn,
                  transportation === item && styles.activeGridBtn,
                ]}
                onPress={() => setTransportation(item)}
              >
                <Text
                  style={[
                    styles.gridBtnText,
                    transportation === item && styles.activeGridBtnText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 7. 일정 페이스 선택 */}
        <View style={styles.card}>
          <View style={styles.labelRowContainer}>
            <View style={styles.labelRow}>
              <Gauge size={20} color="#2563EB" />
              <Text style={styles.label}>여행 일정 페이스</Text>
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
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#2563EB"
            />
            <View style={styles.sliderLimitRow}>
              <Text style={styles.sliderLimitText}>1 (여유)</Text>
              <Text style={styles.sliderLimitText}>10 (빡빡)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          // 💡 isPending이 true일 때 styles.disabledBtn 스타일을 덮어씌웁니다.
          style={[styles.submitBtn, isPending && styles.disabledBtn]}
          onPress={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            // 💡 내부 View의 배경색은 빼고 정렬만 유지합니다.
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContainer: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  headerSubtitle: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  labelRow: { flexDirection: "row", alignItems: "center" },
  labelRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#374151", marginLeft: 8 },
  subLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    paddingLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
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
    backgroundColor: "#F3F4F6",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: { fontSize: 20, fontWeight: "600", color: "#374151" },
  counterText: { fontSize: 16, fontWeight: "600", color: "#111827" },
  chipScroll: { flexDirection: "row", marginTop: 12 },
  chip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeChip: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  chipText: { fontSize: 14, color: "#4B5563", fontWeight: "500" },
  activeChipText: { color: "#2563EB", fontWeight: "600" },
  tagGridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    width: "100%",
    marginTop: 4,
  },
  tagBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTagBtn: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  tagBtnText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
    includeFontPadding: false,
  },
  activeTagBtnText: { color: "#2563EB", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 16 },
  labelRowSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
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
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  gridBtnTwoColumn: {
    width: "48.5%",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeGridBtn: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  gridBtnText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
    includeFontPadding: false,
    textAlignVertical: "center",
    lineHeight: 18,
  },
  activeGridBtnText: { color: "#2563EB", fontWeight: "600" },
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
  sliderLimitText: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
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

  waiting: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
