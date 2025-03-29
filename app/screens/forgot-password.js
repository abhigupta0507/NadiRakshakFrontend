import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrimaryButton } from "../components/Button.js";
import { Mail } from "lucide-react-native";
import { BackendUrl } from "../../secrets.js";
import ToastComponent, { showToast } from "../components/Toast.js"; // Import Toast

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      showToast("error", "Error", "Please enter your email"); // Show error toast
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${BackendUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      showToast("success", "Success", "Password reset link sent to your email"); // Show success toast

      setTimeout(() => {
        router.replace({ pathname: "/screens/verify-reset-otp", params: { email: email } });
      }, 1500); // Slight delay to let the toast show
    } catch (error) {
      showToast("error", "Error", error.message); // Show error toast
    } finally {
      setLoading(false);
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
          <View className="space-y-6 mt-15">
            {/* Title */}
            <View className="items-center p-5">
              <Text className="text-3xl font-bold text-blue-600">Reset Password</Text>
              <Text className="text-gray-500 mt-2 text-center">
                Enter your email to receive a reset link
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
                <Mail color="#6B7280" size={20} className="mr-3" />
                <TextInput
                  className="flex-1 ml-2"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Reset Button */}
            <PrimaryButton
              title={loading ? "Sending..." : "Send Reset Link"}
              onPress={handleResetPassword}
              disabled={loading}
              className="mb-4"
            />

            {/* Back to Login */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-700">Remember your password? </Text>
              <Link href="/screens/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Toast Component (must be at root level) */}
      <ToastComponent />
    </SafeAreaView>
  );
}
