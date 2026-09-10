import { Notice } from "@/types/Notice";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface NoticeItemProps {
  item: Notice;
  theme: any;
}

export const RenderNoticeItem = ({ item, theme }: NoticeItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.card, theme.cardBg]}
      onPress={() => router.push(`/(tabs)/notice/${item.id}`)}
    >
      <Text style={[styles.date, theme.textSub]}>
        {new Date(item.created_at).toLocaleDateString("ko-KR")}
      </Text>

      <Text style={[styles.title, theme.textMain]} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.summary, theme.textSub]} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
  },
  date: {
    fontSize: 12,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
});
