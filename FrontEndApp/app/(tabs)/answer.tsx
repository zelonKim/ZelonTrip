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
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import Markdown from "react-native-markdown-display";

interface AIAnswerResponse {
  keyword: string;
  content: string;
  imageUrl: string;
}

export default function AnswerScreen() {
  const router = useRouter();
  const { keyword } = useLocalSearchParams<{ keyword: string }>();

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          AI가 {keyword} 여행 정보를{"\n"}가져오고 있어요. 🤖
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          <View style={styles.imageOverlay} />

          <View style={styles.titleContainer}>
            <Text style={styles.subtitleText}>AI 맞춤 여행 가이드</Text>
            <Text style={styles.titleText}>{keyword}</Text>
          </View>
        </View>

        {/* 2. 하단 텍스트 가이드북 내용 영역 */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.robotEmoji}>🤖</Text>
              <Text style={styles.cardHeaderTitle}>AI의 특별 가이드</Text>
            </View>

            {/* 💡 기존 <Text> 대신 <Markdown>을 사용하고 전용 스타일을 주입합니다 */}
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

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 26,
  },
  strong: {
    fontWeight: "bold",
    color: "#1F2937",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
});

// 🎨 2. 기본 레이아웃 스타일시트
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4B5563",
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
    backgroundColor: "rgba(0, 0, 0, 0.35)",
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
  titleContainer: {
    position: "absolute",
    bottom: 34,
    left: 20,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  robotEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    marginTop: 20,
    width: "100%",
    height: 52,
    backgroundColor: "#4F46E5",
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
