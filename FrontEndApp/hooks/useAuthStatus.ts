import { useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

export const useAuthStatus = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.warn("인증 토큰 조회 실패:", e);
      setIsLoggedIn(false);
    }
  }, []);

  return { isLoggedIn, checkAuthStatus };
};