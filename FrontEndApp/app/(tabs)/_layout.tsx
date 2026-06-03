import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { Home, CircleUser, CalendarSearch, Bot } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const tabHeight = 45 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: tabHeight,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
        },
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
    </Tabs>
  );
}
