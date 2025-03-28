import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage instead of cookies

import { BackendUrl } from "../../secrets.js";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const params = useGlobalSearchParams();
  const email = params.email;

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
      const response = await fetch(`${BackendUrl}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Store session token in AsyncStorage instead of cookies
        await AsyncStorage.setItem("sessionToken", data.sessionToken);
        console.log("Session Token Stored:", data.sessionToken);

        Alert.alert("Success", "OTP verified successfully!");
        router.push("/home");
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
