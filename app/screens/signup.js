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
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { PrimaryButton } from "../components/Button";

import { BackendUrl } from "../../secrets.js";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    try {
      const response = await fetch(`${BackendUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          age,
          city,
          state: stateName,
          mobileNumber,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // OTP sent successfully
      Alert.alert("OTP Sent", "Please check your email to verify your account.");
      router.push({ pathname: "/screens/verify-otp", params: { email } });
    } catch (error) {
      console.error("Signup error:", error.message);
      setErrorMessage(error.message);
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
          <View className="space-y-6 mt-6">
            {/* App Logo / Title */}
            <View className="items-center">
              <Text className="text-4xl font-bold text-blue-600">
                Nadi Rakshak
              </Text>
              <Text className="text-gray-500 mt-2 text-center">
                River Pollution Reporting
              </Text>
            </View>

            {/* Signup Form */}
            <View>
              {errorMessage ? (
                <Text className="text-red-600 mb-4">{errorMessage}</Text>
              ) : null}

              {/* Name Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>

              {/* Age Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              {/* City Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              {/* State Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="State"
                  value={stateName}
                  onChangeText={setStateName}
                />
              </View>

              {/* Mobile Number Input */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Role Input (Optional: could be a dropdown) */}
              <View className="mb-4">
                <TextInput
                  className="border border-gray-300 p-3 rounded-lg"
                  placeholder="Role (user/admin)"
                  value={role}
                  onChangeText={setRole}
                />
              </View>

              {/* Signup Button */}
              <PrimaryButton
                title="Sign Up"
                onPress={handleSignup}
                className="mb-4"
              />

              {/* Link to Login */}
              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-700">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/screens/login")}>
                  <Text className="text-blue-600 font-semibold">Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
