import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import ToastComponent, { showToast } from "../components/Toast.js"; //  Import Toast
import { BackendUrl } from "../../secrets.js";
import {
  User,
  Mail,
  Lock,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react-native";
import { Link } from "expo-router";


export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState("Public"); // Default role set to 'Public'

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

      //  Show success toast
      showToast(
        "success",
        "OTP Sent",
        "Please check your email to verify your account."
      );
      router.push({ pathname: "/screens/verify-otp", params: { email } });
    } catch (error) {
      console.error("Signup error:", error.message);
      showToast("error", "Signup Failed", error.message); //  Show error toast
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        {/* Header with Image Overlay */}
        <View className="relative">
          <Image
            source={{
              uri: "https://img.freepik.com/free-vector/volunteers-helping-community_23-2148501943.jpg",
            }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40 flex justify-end">
            <View className="p-4">
              <Text className="text-white text-3xl font-bold">
                Nadi Rakshak
              </Text>
              <Text className="text-white text-lg opacity-90">
                Join the movement for cleaner rivers
              </Text>
            </View>
          </View>
        </View>

        <View className="p-6">
          {/* Signup Form */}
          <View className="bg-white p-5 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-semibold mb-4 text-gray-800">
              Create Your Account
            </Text>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Full Name
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <User color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Email
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Mail color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Lock color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>

            {/* Age Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Age
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Calendar color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* City Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                City
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <MapPin color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter city"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            {/* State Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                State
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <MapPin color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter state"
                  value={stateName}
                  onChangeText={setStateName}
                />
              </View>
            </View>

            {/* Mobile Number Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-gray-50">
                <Phone color="#4B5563" size={18} />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChangeText={setMobileNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>


            {/* Signup Button */}
            <TouchableOpacity
              className="py-4 rounded-lg bg-blue-600"
              onPress={handleSignup}
            >
              <Text className="text-white text-center font-bold text-lg">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-700"> Already have an account? </Text>
            <Link href="/screens/login" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
      <ToastComponent />
    </SafeAreaView>
  );
}
