import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { ThemeContext } from "@/utils/ThemeContext";
import { AuthContext } from "@/utils/AuthContext";
import { Providers } from "./providers";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const { isDarkMode, loadThemeConfig, toggleDarkMode } = useThemeConfig();
  const { isLoggedIn, checkAuthStatus } = useAuthStatus();

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadThemeConfig(), checkAuthStatus()]);
      setIsReady(true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <AuthContext.Provider value={{ isLoggedIn, checkAuthStatus }}>
        <Providers isDarkMode={isDarkMode}>
          <StatusBar
            style={isDarkMode ? "light" : "dark"}
            backgroundColor={isDarkMode ? "black" : "white"}
          />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isLoggedIn}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>

            <Stack.Protected guard={isLoggedIn}>
              <Stack.Screen name="(tabs)" />
            </Stack.Protected>
          </Stack>
        </Providers>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
