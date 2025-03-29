import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import ToastComponent, { showToast } from "../components/Toast"; //  Toast Component
import { PrimaryButton } from "../components/Button"; //  Reusable Button
import { Lock } from "lucide-react-native"; //  Password Icon
import { BackendUrl } from "../../secrets.js";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); //  Added confirm password
  const router = useRouter();

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      showToast("error", "Invalid Password", "Password must be at least 6 characters long."); //  Error toast
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "Password Mismatch", "Both passwords must be the same."); //  Error toast
      return;
    }

    try {
      // Get verification token from SecureStore
      const verificationToken = await SecureStore.getItemAsync("verificationToken");
      if (!verificationToken) {
        showToast("error", "Error", "Verification token is missing. Please verify OTP again."); //  Error toast
        return;
      }

      const response = await fetch(`${BackendUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("success", "Success", "Password reset successfully! Redirecting..."); //  Success toast

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        showToast("error", "Error", data.message || "Failed to reset password."); //  Error toast
      }
    } catch (error) {
      console.error("Password Reset Error:", error);
      showToast("error", "Error", "Something went wrong. Please try again."); //  Error toast
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 px-6 justify-center"
          style={{ flexGrow: 1 }}
        >
          <View className="items-center mb-6">
            <Text className="text-4xl font-bold text-blue-600">Nadi Rakshak</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Enter a new password to reset your account.
            </Text>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
              <Lock color="#6B7280" size={20} className="mr-3" />
              <TextInput
                className="flex-1 ml-2"
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-4">
            <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
              <Lock color="#6B7280" size={20} className="mr-3" />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Reset Button */}
          <PrimaryButton title="Reset Password" onPress={handleResetPassword} className="mt-4" />

          {/* Toast Component */}
          <ToastComponent />
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
