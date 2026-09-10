import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { MessageSquare, Trash2 } from "lucide-react-native";
import { formatNotificationDate } from "@/utils/formatNotificationDate";
import { NotificationCardProps } from "@/types/NotificationCardProps";


export const NotificationCard = memo(
  ({ item, theme, styles, onPressItem }: NotificationCardProps) => {
    const handleDelete = (e: GestureResponderEvent) => {
      e.stopPropagation();
    };

    return (
      <TouchableOpacity
        style={[styles.card, theme.cardBg]}
        onPress={() => onPressItem(item.planId)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrapper, theme.iconWrapperBg]}>
            <MessageSquare size={16} color={theme.iconColor} />
          </View>

          <Text style={[styles.dateText, theme.dateTextSub]}>
            {formatNotificationDate(item.date)}
          </Text>

          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={16} color={theme.trashIconColor} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, theme.textMain]}>{item.title}</Text>
        <Text style={[styles.cardBody, theme.textSub]}>{item.body}</Text>
      </TouchableOpacity>
    );
  },
);

NotificationCard.displayName = "NotificationCard";
