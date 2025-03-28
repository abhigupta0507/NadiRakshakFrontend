import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="p-6">
          {/* App Title */}
          <Text className="text-4xl font-bold text-blue-600 text-center">
            Nadi Rakshak
          </Text>
          <Text className="text-center text-gray-500 mt-2">
            Crowdsourced River Pollution Reporting App
          </Text>

          {/* Navigation Buttons */}
          <View className="mt-8 space-y-4">
            <TouchableOpacity
              onPress={() => router.push("/screens/report")}
              className="bg-blue-600 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Report Pollution</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/screens/history")}
              className="bg-green-600 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Report History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/screens/rewards")}
              className="bg-purple-600 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Rewards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/screens/profile")}
              className="bg-gray-600 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
