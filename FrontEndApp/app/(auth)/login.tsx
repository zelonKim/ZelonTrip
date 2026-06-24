import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";
import { useAppTheme, useAuth } from "../_layout";

interface LoginCredentials {
  email: string;
  password: string;
}

const loginApi = async (credentials: LoginCredentials) => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const res = await client.post("/v1/auth/login", formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return res.data;
};

export default function LoginScreen() {
  const { isDarkMode } = useAppTheme();

  const router = useRouter();
  const { checkAuthStatus } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      const { access_token } = data;
      if (access_token) {
        await SecureStore.setItemAsync("userToken", access_token);
        await checkAuthStatus();
        router.replace("/(tabs)");
      } else {
        Alert.alert("안내", "토큰을 받아오지 못했습니다.");
      }
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "로그인 중 에러가 발생했습니다.";
      Alert.alert("안내", errorMsg);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("안내", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    mutate({ email, password });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({ ios: 30, android: 0 })}
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#111827" : "#FFFFFF" },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>ZelonTrip 🏝️</Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? "#E5E7EB" : "#6B7280" },
            ]}
          >
            내가 원하는 맞춤 AI 여행 플래너
          </Text>
        </View>

        <View style={styles.inputGroup}>
          {/* 올바른 스타일 배열 문법 적용 */}
          <Text
            style={[
              styles.label,
              { color: isDarkMode ? "#F3F4F6" : "#374151" },
            ]}
          >
            이메일
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: isDarkMode ? "#F3F4F6" : "#111827",
                borderColor: isDarkMode ? "#111827" : "#E5E7EB",
                backgroundColor: isDarkMode ? "#374151" : "#F9FAFB",
              },
            ]}
            placeholder="이메일을 입력해주세요"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "gray"}
          />

          <Text
            style={[
              styles.label,
              { color: isDarkMode ? "#F3F4F6" : "#374151" },
            ]}
          >
            비밀번호
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: isDarkMode ? "#F3F4F6" : "#111827",
                borderColor: isDarkMode ? "#111827" : "#E5E7EB",
                backgroundColor: isDarkMode ? "#374151" : "#F9FAFB",
              },
            ]}
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isPending}
            placeholderTextColor={isDarkMode ? "#9CA3AF" : "gray"}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, isPending && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.loadingRow}>
              <Text style={styles.loginBtnText}>로그인 중 </Text>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <Text style={styles.loginBtnText}>로그인하기</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupLink}>
          <Text
            style={{ color: isDarkMode ? "#E5E7EB" : "#374151", fontSize: 14 }}
          >
            아직 계정이 없으신가요?{" "}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            disabled={isPending}
          >
            <Text style={styles.loginLinkText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 165 : 130,
  },
  header: { marginBottom: 48, alignItems: "center" },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#2563EB",
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  subtitle: { fontSize: 13, fontWeight: "500" },
  inputGroup: { marginBottom: 32 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    paddingLeft: 2,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },
  loginBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledBtn: { backgroundColor: "#9CA3AF", shadowColor: "transparent" },
  loginBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  signupLink: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupLinkText: {
    color: "#4B5563",
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  loginLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});
