import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { Ionicons } from "@expo/vector-icons";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs // 앱 하단에 탭 네비게이션바를 생성함.
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 100,
        },
      }}
    >
      <Tabs.Screen // 탭의 메뉴를 등록함.
        name="index" // index.tsx파일을 해당 탭에 연결함.
        options={{
          title: "홈", // 해당 탭 메뉴에 표시될 텍스트를 지정함.

          tabBarIcon: (
            { focused }, // 탭바 아이콘을 렌더링함.  // 현재 선택된 탭일 경우, focused 매개변수 값으로 true가 전달됨.
          ) => <Ionicons name={focused ? "home" : "home-outline"} size={20} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "둘러보기",

          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "telescope" : "telescope-outline"}
              size={20}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "검색",

          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={20} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",

          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={20} />
          ),
        }}
      />
    </Tabs>
  );
}
