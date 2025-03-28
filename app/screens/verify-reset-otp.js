import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';


import { BackendUrl } from "../../secrets.js";

export default function VerifyPasswordResetOTP() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const params = useGlobalSearchParams();
  const email = params.email;

  console.log(email);
  if (!email) {
    return (
      <View style={{ padding: 20, paddingTop: 100 }}>
        <Text style={{ color: "red" }}>
          Email is missing. Please go back and try again.
        </Text>
      </View>
    );
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "OTP must be 6 digits long.");
      return;
    }

    try {
      console.log(`opt:${email} , ${otp}`);
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
        console.log("Verification Token Stored:", data.verificationToken);
        Alert.alert("Success", "OTP verified successfully!");
        router.replace({ pathname: "/screens/reset-password", params: { email: email } });

      } else {
        Alert.alert("Error", data.message || "Invalid OTP, try again.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", "Something went wrong, please try again.");
    }
  };

  return (
    <View style={{ padding: 20, paddingTop: 50 }}>
      <Text>Enter OTP sent to {email}</Text>
      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
    </View>
  );
}
