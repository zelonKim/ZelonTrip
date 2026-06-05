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
import { useAuth } from "../_layout";

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
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>ZelonTrip 🤖</Text>
          <Text style={styles.subtitle}>AI 기반 스마트 여행 플래너</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isPending}
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

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={styles.signupLink}
          disabled={isPending}
        >
          <Text style={{ color: "#6B7280" }}> 아직 계정이 없으신가요? </Text>
          <Text style={styles.loginLinkText}>회원가입</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { padding: 24, paddingTop: 100 },
  header: { marginBottom: 48, alignItems: "center" },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#2563EB",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
  inputGroup: { marginBottom: 32 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    paddingLeft: 2,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
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
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupLinkText: {
    color: "#4B5563",
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  loginLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
