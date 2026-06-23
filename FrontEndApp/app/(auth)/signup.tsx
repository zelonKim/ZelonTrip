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
import { useMutation } from "@tanstack/react-query";
import { client } from "@/api/client";

interface SignUpData {
  username: string;
  password: string;
  password_confirm: string;
}

const signupApi = async (signUpData: SignUpData) => {
  const res = await client.post("/v1/auth/signup", signUpData);
  return res.data;
};

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      Alert.alert(
        "환영합니다 🤗",
        "회원가입이 완료되었습니다. 로그인해주세요.",
        [{ text: "확인", onPress: () => router.push("/(auth)/login") }],
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail || "회원가입에 실패했습니다.";
      Alert.alert("안내", errorMsg);
    },
  });

  const handleSignup = () => {
    // 1. 빈 값 검사
    if (!email || !password || !passwordConfirm) {
      Alert.alert("안내", "모든 정보를 입력해주세요.");
      return;
    }

    // 💡 2. 이메일 형식 유효성 검사 (정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("안내", "올바른 이메일 형식으로 입력해주세요.");
      return;
    }

    // 💡 3. 비밀번호 조합 검사 (영문, 숫자 포함 최소 8자 이상)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "안내",
        "비밀번호는 영문과 숫자를 조합하여 8자리 이상으로 입력해주세요.",
      );
      return;
    }

    // 4. 비밀번호 일치 검사
    if (password !== passwordConfirm) {
      Alert.alert("안내", "비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    mutate({
      username: email,
      password,
      password_confirm: passwordConfirm,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.select({
        ios: 30,
        android: 0,
      })}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI와 함께 떠나요! ✈️</Text>
          <Text style={styles.subtitle}>
            ZelonTrip과 함께 여행을 시작해볼까요?
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isPending}
            placeholderTextColor={"gray"}
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="영문+숫자 조합 8자 이상"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!isPending}
            placeholderTextColor={"gray"}
          />

          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            autoCapitalize="none"
            editable={!isPending}
            placeholderTextColor={"gray"}
          />
        </View>

        <TouchableOpacity
          style={[styles.signupBtn, isPending && styles.disabledBtn]}
          onPress={handleSignup}
          disabled={isPending}
        >
          {isPending ? (
            <View style={styles.loadingRow}>
              <Text style={styles.signupBtnText}>가입 중 </Text>
              <ActivityIndicator size="small" color="#FFFFFF" />
            </View>
          ) : (
            <Text style={styles.signupBtnText}>시작하기</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginLink}>
          <Text style={{ color: "#6B7280" }}>이미 계정이 있으신가요?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            disabled={isPending}
          >
            <Text style={styles.loginLinkText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: { padding: 24, paddingTop: 80 },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6B7280" },
  inputGroup: { marginBottom: 32 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111827",
  },
  signupBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  disabledBtn: { backgroundColor: "#9CA3AF" },
  signupBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loginLink: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  loginLinkText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});
