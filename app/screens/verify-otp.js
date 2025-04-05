import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import OTPInput from "../components/Otp.js";
import { PrimaryButton } from "../components/Button";
import { BackendUrl } from "../../secrets.js";
import ToastComponent, { showToast } from "../components/Toast.js";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [resendClicked, setResendClicked] = useState(false);
  const router = useRouter();
  const params = useGlobalSearchParams();
  const email = params.email;

  useEffect(() => {
    if (!resendEnabled && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer <= 0) {
      setResendEnabled(true);
    }
  }, [timer, resendEnabled]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showToast("error", "Invalid OTP", "OTP must be 6 digits long.");
      return;
    }

    try {
      const response = await fetch(`${BackendUrl}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("accessToken", data.accessToken);

        setTimeout(() => {
          showToast("info", "🎉 50 Points Earned!", "You got 50 points for signing up! 🪙", "blue");
        }, 500); 
      
        setTimeout(() => router.replace("/"), 3000);
      } else {
        showToast("error", "OTP Error", data.message || "Invalid OTP, try again.");
      }
    } catch (error) {
      showToast("error", "Error", "Something went wrong, please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${BackendUrl}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, type: "signup" }), // or "reset" if it's reset
      });

      const data = await response.json();

      if (response.ok) {
        showToast("success", "OTP Resent", "A new OTP has been sent to your email.");
        setResendClicked(true);
        setResendEnabled(false); // Optional safety
      } else {
        showToast("error", "Resend Failed", data.message || "Could not resend OTP.");
      }
    } catch (err) {
      showToast("error", "Error", "Something went wrong while resending OTP.");
    }
  };

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-600">Email is missing. Please go back and try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="always"
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

          <OTPInput value={otp} setValue={setOtp} />

          <PrimaryButton title="Verify OTP" onPress={handleVerifyOTP} className="mt-6" />

          <View className="mt-4 items-center">
          {resendClicked ? (
            <Text className="text-gray-400 font-semibold mt-2">Resend disabled</Text>
          ) : resendEnabled ? (
            <TouchableOpacity
              onPress={async () => {
                setResendClicked(true); // Disable immediately on click
                setResendEnabled(false); // Prevent display again just in case
                try {
                  const response = await fetch(`${BackendUrl}/auth/resend-otp`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, type: "signup" }), // or "reset" if applicable
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message || "Failed to resend OTP");
                  }

                  showToast("success", "OTP Resent", "Please check your email.");
                  setResendClicked(true);
                  setResendEnabled(false); // optional safety
                } catch (error) {
                  showToast("error", "Resend Failed", error.message);
                }
              }}
            >
              <Text className="text-blue-600 font-semibold mt-2">Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-gray-400 font-semibold mt-2">
              You can resend OTP in {timer}s
            </Text>
          )}
        </View>

        </KeyboardAvoidingView>
      </ScrollView>

      <ToastComponent />
    </SafeAreaView>
  );
}
