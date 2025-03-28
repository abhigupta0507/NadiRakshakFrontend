import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from 'expo-secure-store';


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
import { PrimaryButton } from "../components/Button";
import { Lock, Mail, EyeOff, Eye } from "lucide-react-native";

import { BackendUrl } from "../../secrets.js"

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();


  const handleLogin = async () => {
    try {
      const response = await fetch(`${BackendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store tokens
      await SecureStore.setItem("accessToken", data.accessToken);
      await SecureStore.setItem("refreshToken", data.refreshToken);

      console.log("Login successful:", data);

      // Navigate to Home screen
      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white ">
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
            {/* App Logo or Title */}
            <View className="items-center">
              <Text className="text-4xl font-bold text-blue-600">
                Nadi Rakshak
              </Text>
              <Text className="text-gray-500 mt-2 text-center">
                River Pollution Reporting
              </Text>
            </View>

            {/* Login Form */}
            <View>
              <Text className="text-2xl font-semibold mb-6 text-gray-800">
                {/* Welcome Back */}
              </Text>

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

              {/* Password Input */}
              <View className="mb-2">
                <View className="flex-row items-center border border-gray-300 rounded-lg p-3">
                  <Lock color="#6B7280" size={20} className="mr-3" />
                  <TextInput
                    className="flex-1 ml-2"
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? (
                      <Eye color="#6B7280" size={20} />
                    ) : (
                      <EyeOff color="#6B7280" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <View className="items-end mb-6">
                <Link href="/screens/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Login Button */}
              <PrimaryButton
                title="Login"
                onPress={handleLogin}
                className="mb-4"
              />

              {/* Sign Up Link */}
              <View className="flex-row justify-center mt-4">
                <Text className="text-gray-700">Don't have an account? </Text>
                <Link href="/screens/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold">Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
