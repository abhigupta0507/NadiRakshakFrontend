import { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { BackendUrl } from "../../secrets.js";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }

    try {
      // Get verification token from SecureStore
      const verificationToken = await SecureStore.getItemAsync("verificationToken");
      if (!verificationToken) {
        Alert.alert("Error", "Verification token is missing. Please verify OTP again.");
        return;
      }

      const response = await fetch(`${BackendUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // No need to manually add cookie header unless backend requires it
        },
        body: JSON.stringify({ verificationToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password reset successfully!");
        router.push("/login");
      } else {
        Alert.alert("Error", data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Password Reset Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={{ padding: 20, paddingTop: 50 }}>
      <Text>Enter New Password</Text>
      <TextInput
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          borderRadius: 5,
        }}
        secureTextEntry
        maxLength={30}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Button title="Reset Password" onPress={handleResetPassword} />
    </View>
  );
}
