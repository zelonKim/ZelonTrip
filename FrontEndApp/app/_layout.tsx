import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen, Stack } from "expo-router";
import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { APIProvider } from "@/api/api-provider";
import defaultThemeConfig from "@/utils/use-theme-config"; // 💡 기존 테마 설정 가져오기
import * as SecureStore from "expo-secure-store";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as FileSystem from "expo-file-system";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

// 🔐 1. 기존 인증 관련 Context 유지
const AuthContext = createContext<{
  isLoggedIn: boolean;
  checkAuthStatus: () => Promise<void>;
}>({ isLoggedIn: false, checkAuthStatus: async () => {} });

export const useAuth = () => useContext(AuthContext);

// 🌓 2. 새롭게 추가되는 전역 다크모드 테마 Context 선언
const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
}>({ isDarkMode: false, toggleDarkMode: async () => {} });

export const useAppTheme = () => useContext(ThemeContext);

const THEME_CONFIG_PATH = `${FileSystem.documentDirectory}theme_config.json`;

// 💡 전역 프로바이더들을 묶어주는 컴포넌트 (isDarkMode 상태를 받아 테마 반영)
const Providers = ({
  children,
  isDarkMode,
}: {
  children: ReactNode;
  isDarkMode: boolean;
}) => {
  // 기존 수동 테마 설정 기반 위에 다크모드 컬러가 덮어씌워지도록 병합 처리
  const currentTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      ...defaultThemeConfig.colors, // 기본 테마의 커스텀 키가 있다면 유지
      background: isDarkMode ? "#111827" : "#F9FAFB", // 앱 전체 기본 배경색 지정
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

export default function RootLayout() {
  const systemColorScheme = useColorScheme();

  // 🌓 테마 및 🔐 인증 상태 통합 관리
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    systemColorScheme === "dark",
  );
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  // 🌓 다크모드 로컬 파일 로드 및 설정 핸들러
  const loadThemeConfig = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(THEME_CONFIG_PATH);
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(THEME_CONFIG_PATH);
        setIsDarkMode(JSON.parse(content).darkMode);
      }
    } catch (e) {
      console.log("전역 테마 로드 실패:", e);
    }
  };

  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      await FileSystem.writeAsStringAsync(
        THEME_CONFIG_PATH,
        JSON.stringify({ darkMode: value }),
      );
    } catch (e) {
      console.log("전역 테마 저장 실패:", e);
    }
  };

  // 🔐 기존 인증 토큰 체크 로직 유지
  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.warn("인증 토큰 조회 실패:", e);
      setIsLoggedIn(false);
    }
  };

  // 🚀 앱 초기화 통합 실행 (테마 로드 + 인증 체크)
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
