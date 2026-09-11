import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { APIProvider } from "@/api/api-provider";
import defaultThemeConfig from "@/utils/use-theme-config";
import { KeyboardProvider } from "react-native-keyboard-controller";

export const Providers = ({
  children,
  isDarkMode,
}: {
  children: ReactNode;
  isDarkMode: boolean;
}) => {
  const currentTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      ...defaultThemeConfig.colors,
      background: isDarkMode ? "#111827" : "#F9FAFB",
    },
  };

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <APIProvider>
          <ThemeProvider value={currentTheme}>{children}</ThemeProvider>
        </APIProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
};
