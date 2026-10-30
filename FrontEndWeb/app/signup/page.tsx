"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignup } from "@/hooks/useSignup";
import { useTheme } from "@/context/ThemeContext";
import { useSignupLanguage } from "@/hooks/languages/useSignupLanguage";

export default function SignupPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { t } = useSignupLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const { mutate: signupMutation, isPending: isSignupPending } = useSignup();

  const handleSignup = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !passwordConfirm) return alert(t.alertInputAll);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return alert(t.alertInvalidEmail);
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password))
      return alert(t.alertInvalidPassword);
    if (password !== passwordConfirm) return alert(t.alertPasswordMismatch);

    signupMutation({
      username: email,
      password,
      password_confirm: passwordConfirm,
    });
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-6 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
      }`}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="mb-8">
          <h1
            className={`text-2xl font-extrabold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.title}
          </h1>
          <p
            className={`text-md ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.emailLabel}
            </label>
            <input
              type="email"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.passwordLabel}
            </label>
            <input
              type="password"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.passwordConfirmLabel}
            </label>
            <input
              type="password"
              className={`w-full text-[15px] rounded-xl p-3 border outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
              placeholder={t.passwordConfirmPlaceholder}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={isSignupPending}
            />
          </div>

          <button
            type="submit"
            disabled={isSignupPending}
            className="cursor-pointer mt-3 w-full rounded-xl bg-blue-600 py-3 text-white font-bold text-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isSignupPending ? t.signingUp : t.signupButton}
          </button>
        </form>

        <p
          className={`text-center text-sm font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {t.alreadyHaveAccount}{" "}
          <button
            onClick={() => router.push("/login")}
            className="cursor-pointer text-blue-500 font-semibold hover:underline hover:font-bold"
          >
            {t.login}
          </button>
        </p>
      </div>
    </div>
  );
}
