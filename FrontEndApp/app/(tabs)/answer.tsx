import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import {
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import Markdown from "react-native-markdown-display";
import { useAppTheme } from "../_layout"; 

interface AIAnswerResponse {
  keyword: string;
  content: string;
  imageUrl: string;
}

export default function AnswerScreen() {
  const router = useRouter();
  const { keyword } = useLocalSearchParams<{ keyword: string }>();
  const { isDarkMode } = useAppTheme(); // 💡 다크모드 상태 가져오기

  // 💡 사용하시던 마이페이지/알림함 포맷과 100% 동일한 유기적 테마 객체 생성
  const theme = {
    container: { backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" },
    loadingContainer: { backgroundColor: isDarkMode ? "#111827" : "#FFFFFF" },
    textMain: { color: isDarkMode ? "#F9FAFB" : "#111827" },
    textSub: { color: isDarkMode ? "#9CA3AF" : "#4B5563" },
    cardBg: {
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: isDarkMode ? "#374151" : "#E5E7EB",
    },
    cardHeader: {
      borderBottomColor: isDarkMode ? "#374151" : "#F3F4F6",
    },
    imageOverlay: {
      backgroundColor: isDarkMode
        ? "rgba(0, 0, 0, 0.55)"
        : "rgba(0, 0, 0, 0.35)",
    },
    indicatorColor: isDarkMode ? "#60A5FA" : "#2563EB",
  };

  // 💡 마크다운 전용 내부 텍스트 스타일도 theme 객체(isDarkMode) 기준으로 스위칭
  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: 16,
      color: isDarkMode ? "#E5E7EB" : "#374151",
      lineHeight: 26,
    },
    strong: {
      fontWeight: "bold",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    heading1: { color: isDarkMode ? "#FFFFFF" : "#1F2937", marginVertical: 10 },
    heading2: { color: isDarkMode ? "#FFFFFF" : "#1F2937", marginVertical: 8 },
    heading3: { color: isDarkMode ? "#E5E7EB" : "#374151", marginVertical: 6 },
  });

  const { data: aiAnswer, isPending } = useQuery<AIAnswerResponse>({
    queryKey: ["aiAnswer", keyword],
    queryFn: async () => {
      const response = await client.post("/v1/location/ask", { keyword });
      return response.data;
    },
    enabled: !!keyword,
  });

  if (isPending) {
    return (
      <View style={[styles.loadingContainer, theme.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.indicatorColor} />
        <Text style={[styles.loadingText, theme.textSub]}>
          AI가 {keyword} 여행 정보를{"\n"}가져오고 있어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme.container]}>
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 상단 대표 랜드마크 이미지 영역 */}
        <View style={styles.imageHeader}>
          <Image
            source={{ uri: aiAnswer?.imageUrl }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          {/* 다크모드 대응 딤 처리 오버레이 */}
          <View style={[styles.imageOverlay, theme.imageOverlay]} />

          <View style={titleContainerStyle(isDarkMode)}>
            <Text style={styles.subtitleText}>AI 맞춤 여행 가이드</Text>
            <Text style={styles.titleText}>{keyword}</Text>
          </View>
        </View>

        {/* 2. 하단 텍스트 가이드북 내용 영역 */}
        <View style={styles.cardContainer}>
          <View style={[styles.card, theme.cardBg]}>
            <View style={[styles.cardHeader, theme.cardHeader]}>
              <Text style={styles.robotEmoji}>🤖</Text>
              <Text style={[styles.cardHeaderTitle, theme.textMain]}>
                AI의 특별 가이드
              </Text>
            </View>

            {/* 마크다운 스타일 주입 */}
            <Markdown style={markdownStyles}>{aiAnswer?.content}</Markdown>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 고정 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// 다크모드 시 타이틀 텍스트 가시성 보정을 위한 유동 함수 스타일 (필요시)
const titleContainerStyle = (isDarkMode: boolean) => ({
  position: "absolute" as const,
  bottom: 34,
  left: 20,
});

// 🎨 기존 구조 기반 스타일시트 (하드코딩 컬러값 제거 및 스타일 정제)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  contentScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  imageHeader: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  subtitleText: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 4,
    fontWeight: "500",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: -16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  robotEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 20,
    width: "100%",
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
