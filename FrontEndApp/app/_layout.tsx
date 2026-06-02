import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen, Stack } from "expo-router";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ThemeProvider } from "@react-navigation/native";
import { APIProvider } from "@/api/api-provider";
import { Linking } from "react-native";
import theme from "@/utils/use-theme-config";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <GestureHandlerRootView>
      <APIProvider>
        <ThemeProvider value={theme}>{children}</ThemeProvider>
      </APIProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
