import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  Search,
  Sparkles,
  MapPin,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  Star,
} from "lucide-react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 상단 헤더 섹션 */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.locationLabel}>현재 위치</Text>
          <TouchableOpacity style={styles.locationSelector}>
            <MapPin size={14} color="#2563EB" />
            <Text style={styles.locationText}>서울, 대한민국</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#1F2937" strokeWidth={2} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* 2. 메인 웰컴 카피 */}
      <View style={styles.welcomeSection}>
        <Text style={styles.userName}>성진님,</Text>
        <Text style={styles.welcomeTitle}>어디로 떠나고 {"\n"}싶으신가요?</Text>
      </View>

      {/* 3. AI 스마트 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="AI에게 여행지를 말해보세요"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity>
            <SlidersHorizontal size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. AI 큐레이션 섹션 (가로 스크롤 카드) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.row}>
            <Sparkles size={20} color="#2563EB" fill="#2563EB" />
            <Text style={styles.sectionTitle}>맞춤 여행 플랜</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>전체보기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardList}
        >
          {/* 더미 카드 1 */}
          <TouchableOpacity style={styles.card}>
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardTag}>#힐링</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>강릉 해변 카페 투어</Text>
              <View style={styles.cardInfo}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.rating}>4.8</Text>
                <Text style={styles.distance}>• 1.2km</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 더미 카드 2 */}
          <TouchableOpacity style={styles.card}>
            <View
              style={[
                styles.cardImagePlaceholder,
                { backgroundColor: "#E0F2FE" },
              ]}
            >
              <Text style={styles.cardTag}>#맛집</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>망원동 숨은 맛집 정복</Text>
              <View style={styles.cardInfo}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.rating}>4.9</Text>
                <Text style={styles.distance}>• 0.5km</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. 실시간 가이드 바로가기 배너 */}
      <TouchableOpacity style={styles.banner}>
        <View>
          <Text style={styles.bannerSubtitle}>여행 중이신가요?</Text>
          <Text style={styles.bannerTitle}>여행 지도 켜기</Text>
        </View>
        <View style={styles.bannerIcon}>
          <ChevronRight size={24} color="#FFF" />
        </View>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
  },
  locationLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 2 },
  locationSelector: { flexDirection: "row", alignItems: "center" },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 24 },
  userName: { fontSize: 18, color: "#4B5563", fontWeight: "500" },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 36,
    marginTop: 4,
  },
  searchContainer: { paddingHorizontal: 20, marginBottom: 32 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },
  section: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  seeAll: { fontSize: 14, color: "#6B7280" },
  cardList: { paddingLeft: 20 },
  card: {
    width: 220,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: "#FFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImagePlaceholder: {
    height: 140,
    backgroundColor: "#EEF2FF",
    padding: 12,
    justifyContent: "flex-end",
  },
  cardTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },
  cardContent: { padding: 12 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  cardInfo: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginLeft: 4 },
  distance: { fontSize: 14, color: "#9CA3AF", marginLeft: 4 },
  banner: {
    marginHorizontal: 20,
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  bannerTitle: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
