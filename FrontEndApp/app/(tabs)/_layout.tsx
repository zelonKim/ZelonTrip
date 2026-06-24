import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { Home, CircleUser, CalendarSearch, Bot } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../_layout";
import { Platform } from "react-native";

export default function TabLayout() {
  const { isDarkMode } = useAppTheme();

  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const tabHeight = (Platform.OS === "ios" ? 36 : 56) + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: tabHeight,
          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
          borderTopWidth: 1,
          borderColor: isDarkMode ? "#374151" : "#E5E7EB",
          paddingTop: 6,
        },
        tabBarActiveTintColor: isDarkMode ? "#60A5FA" : "#2563EB",
        tabBarInactiveTintColor: isDarkMode ? "#9CA3AF" : "#6B7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => (
            <Home
              size={25}
              color={focused ? "#2563EB" : "#9CA3AF"}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="generate"
        options={{
          title: "여행 생성",

          tabBarIcon: ({ focused }) => (
            <Bot
              size={30}
              color={focused ? "#2563EB" : "#9CA3AF"}
              strokeWidth={focused ? 2.3 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="plans"
        options={{
          title: "여행 계획",

          tabBarIcon: ({ focused }) => (
            <CalendarSearch
              size={25}
              color={focused ? "#2563EB" : "#9CA3AF"}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mypage"
        options={{
          title: "마이페이지",

          tabBarIcon: ({ focused }) => (
            <CircleUser
              size={25}
              color={focused ? "#2563EB" : "#9CA3AF"}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="plan/[id]"
        options={{
          title: "상세 일정",
          href: null,
        }}
      />

      <Tabs.Screen
        name="answer"
        options={{
          title: "AI 답변",
          href: null,
        }}
      />

      <Tabs.Screen
        name="notice/index"
        options={{
          title: "공지사항",
          href: null,
        }}
      />
      <Tabs.Screen
        name="notice/[id]"
        options={{
          title: "공지사항 상세",
          href: null,
        }}
      />
    </Tabs>
  );
}
