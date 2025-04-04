import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import ToastComponent, { showToast } from "../components/Toast.js";
import { BackendUrl } from "../../secrets";

export default function RiversScreen() {
  const [rivers, setRivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchRivers();
  }, []);

  const fetchRivers = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        setTimeout(() => router.push("/screens/login"), 1500);
        return;
      }

      const response = await fetch(`${BackendUrl}/rivers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setRivers(result.data.rivers);
      } else {
        setError(result.message || "Failed to fetch rivers");
        showToast("error", "Error", result.message || "Failed to fetch rivers");
      }
    } catch (error) {
      console.error("Fetch Rivers Error:", error);
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRiverPress = (riverId) => {
    router.push(`/screens/river-stations/${riverId}`);
  };

  // River image mapping (you can replace these with actual river images)
  const riverImages = {
    default: require("../../assets/default-river.jpg"),
    // Add specific river images based on their names or IDs if available
    // 'Ganges': require('../../assets/ganges.jpg'),
    // 'Yamuna': require('../../assets/yamuna.jpg'),
  };

  const getRiverImage = (riverName) => {
    // Return specific image if available, otherwise default
    return riverImages.default;
  };

  const renderRiverItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleRiverPress(item._id)}
      className="bg-white rounded-xl overflow-hidden shadow-md mb-4"
    >
      <View className="h-32 relative">
        <Image
          source={getRiverImage(item.name)}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-blue-600 mt-4 font-medium">
          Loading rivers...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-4 bg-white">
        <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />
        <Text className="text-red-500 text-center my-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchRivers}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Rivers</Text>
        <Text className="text-gray-600">
          Select a river to view its stations
        </Text>
      </View>

      {rivers.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="water-outline" size={60} color="#2563eb" />
          <Text className="text-gray-700 text-center mt-4 text-lg">
            No rivers found. Check back later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rivers}
          renderItem={renderRiverItem}
          keyExtractor={(item) => item._id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
        />
      )}
      <ToastComponent />
    </SafeAreaView>
  );
}
