import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
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
import { useAppTheme } from "@/utils/ThemeContext";
import { LocationAnswerResponse } from "@/types/LocationAnswer";
import { getLocationAnswer } from "@/api/location/getLocationAnswer";

export default function AnswerScreen() {
  const router = useRouter();
  const { keyword } = useLocalSearchParams<{ keyword: string }>();
  const { isDarkMode } = useAppTheme();

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

  ///////////////////////////////////////////////////////////////////////////////

  const { data: locationAnswer, isPending } = useQuery<LocationAnswerResponse>({
    queryKey: ["aiAnswer", keyword],
    queryFn: () => getLocationAnswer(keyword),
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

  ///////////////////////////////////////////////////////////////////////////////

  return (
    <View style={[styles.container, theme.container]}>
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageHeader}>
          <Image
            source={{ uri: locationAnswer?.imageUrl }}
            style={styles.headerImage}
            resizeMode="cover"
          />

          <View style={[styles.imageOverlay, theme.imageOverlay]} />

          <View style={titleContainerStyle(isDarkMode)}>
            <Text style={styles.subtitleText}>AI 맞춤 여행 가이드</Text>
            <Text style={styles.titleText}>{keyword}</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={[styles.card, theme.cardBg]}>
            <View style={[styles.cardHeader, theme.cardHeader]}>
              <Text style={styles.robotEmoji}>🤖</Text>
              <Text style={[styles.cardHeaderTitle, theme.textMain]}>
                AI의 특별 가이드
              </Text>
            </View>

            <Markdown style={markdownStyles}>
              {locationAnswer?.content}
            </Markdown>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>홈으로</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

///////////////////////////////////////////////////////////////////////////////

const titleContainerStyle = (isDarkMode: boolean) => ({
  position: "absolute" as const,
  bottom: 34,
  left: 20,
});

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
