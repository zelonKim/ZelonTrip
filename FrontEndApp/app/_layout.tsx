import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SplashScreen, Stack } from "expo-router";
import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { ThemeProvider } from "@react-navigation/native";
import { APIProvider } from "@/api/api-provider";
import theme from "@/utils/use-theme-config";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext<{
  isLoggedIn: boolean;
  checkAuthStatus: () => Promise<void>;
}>({ isLoggedIn: false, checkAuthStatus: async () => {} });

export const useAuth = () => useContext(AuthContext);

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.warn("인증 토큰 조회 실패:", e);
      setIsLoggedIn(false);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    checkAuthStatus();
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
    <AuthContext.Provider value={{ isLoggedIn, checkAuthStatus }}>
      <Providers>
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
  );
}
