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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import ToastComponent, { showToast } from "../components/Toast.js";
import { BackendUrl } from "../../secrets.js";

export default function RiverStationsScreen() {
  const { riverId } = useLocalSearchParams();
  const [riverData, setRiverData] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchStations();
  }, [riverId]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("accessToken");

      if (!token) {
        showToast("error", "Unauthorized", "Please log in again.");
        setTimeout(() => router.push("/screens/login"), 1500);
        return;
      }

      const response = await fetch(`${BackendUrl}/rivers/${riverId}/stations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setRiverData({
          name: result.data.riverName,
        });
        setStations(result.data.stations);
      } else {
        setError(result.message || "Failed to fetch stations");
        showToast(
          "error",
          "Error",
          result.message || "Failed to fetch stations"
        );
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      showToast("error", "Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStationPress = (stationCode) => {
    router.push(`/screens/station-details/${riverId}/${stationCode}`);
  };

  const renderStationItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleStationPress(item.stationCode)}
      className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden"
    >
      <View className="flex-row p-4 items-center">
        <View className="h-12 w-12 rounded-full bg-blue-100 items-center justify-center mr-3">
          <Ionicons name="water" size={24} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-lg">
            {item.name}
          </Text>
          <Text className="text-gray-600">{item.stateName}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              Station Code: {item.stationCode}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-blue-600 mt-4 font-medium">
          Loading stations...
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
          onPress={fetchStations}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            {riverData?.name}
          </Text>
          <Text className="text-gray-600">Monitoring Stations</Text>
        </View>
      </View>

      {stations.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="location-outline" size={60} color="#2563eb" />
          <Text className="text-gray-700 text-center mt-4 text-lg">
            No stations found for this river.
          </Text>
        </View>
      ) : (
        <FlatList
          data={stations}
          renderItem={renderStationItem}
          keyExtractor={(item) => item._id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
        />
      )}
      <ToastComponent />
    </SafeAreaView>
  );
}
