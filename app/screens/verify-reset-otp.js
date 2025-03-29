import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import OTPInput from "../components/Otp.js"; //  Reusable OTP component
import { PrimaryButton } from "../components/Button"; //  Reusable button component
import ToastComponent, { showToast } from "../components/Toast.js"; //  Toast Component

import { BackendUrl } from "../../secrets.js";

export default function VerifyPasswordResetOTP() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const params = useGlobalSearchParams();
  const email = params.email;

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">Email is missing. Please go back and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showToast("error", "Invalid OTP", "OTP must be 6 digits long."); //  Error toast
      return;
    }

    try {
      console.log(`OTP Entered: ${otp} for ${email}`);

      const response = await fetch(`${BackendUrl}/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("verificationToken", data.verificationToken);
        showToast("success", "OTP Verified", "Redirecting to reset password..."); //  Success toast

        setTimeout(() => {
          router.replace({ pathname: "/screens/reset-password", params: { email } });
        }, 1500);
      } else {
        showToast("error", "OTP Error", data.message || "Invalid OTP, try again."); //  Error toast
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong, please try again."); //  Error toast
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
              Enter the OTP sent to {email}
            </Text>
          </View>

          {/*  Reusable OTP Input */}
          <OTPInput value={otp} setValue={setOtp} />

          {/*  Verify OTP Button */}
          <PrimaryButton title="Verify OTP" onPress={handleVerifyOTP} className="mt-6" />
        </KeyboardAvoidingView>
      </ScrollView>

      {/*  Toast Component */}
      <ToastComponent />
    </SafeAreaView>
  );
}
