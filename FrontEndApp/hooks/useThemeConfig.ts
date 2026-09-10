import { useState, useCallback } from "react";
import * as FileSystem from "expo-file-system";

const THEME_CONFIG_PATH = `${FileSystem.documentDirectory}theme_config.json`;

export const useThemeConfig = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const loadThemeConfig = useCallback(async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(THEME_CONFIG_PATH);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(THEME_CONFIG_PATH);
        const parsed = JSON.parse(content);
        setIsDarkMode(!!parsed.darkMode);
      }
    } catch (e) {
      console.log("전역 테마 로드 실패:", e);
    }
  }, []);

  const toggleDarkMode = useCallback(async (value: boolean) => {
    setIsDarkMode(value);
    try {
      await FileSystem.writeAsStringAsync(
        THEME_CONFIG_PATH,
        JSON.stringify({ darkMode: value })
      );
    } catch (e) {
      console.log("전역 테마 저장 실패:", e);
    }
  }, []);

  return { isDarkMode, loadThemeConfig, toggleDarkMode };
};